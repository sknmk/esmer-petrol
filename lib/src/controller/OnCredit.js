import { ipcMain } from 'electron'
import _ from 'lodash'
import moment from 'moment'
import Oncredit from '../model/OnCredit'
import OncreditProduct from '../model/OncreditProduct'
import CustomerMoneyFlow from '../model/CustomerMoneyFlow'
import Helper from './Helper'
import Branch from '../model/Branch'
import escpos from 'escpos'
import escpostNetwork from 'escpos-network'

const path = require('path')

ipcMain.on('/oncredit/create', (e, form) => {
  const model = new Oncredit()
  const parameters = Oncredit.setParams(form)
  const validation = Oncredit.validate(parameters, form.products)
  if (!validation.status) {
    e.reply('oncreditCreate', validation)
    return false
  }
  model.create(parameters)
    .then(rowId => {
      const oncreditId = rowId[0]
      for (const i in form.products) {
        const opModel = new OncreditProduct()
        const opParameters = OncreditProduct.setParams(form.products[i], oncreditId)
        const opValidation = OncreditProduct.validate(opParameters, i)
        if (!opValidation.status) {
          e.reply('oncreditCreate', opValidation)
          return false
        }
        opModel.create(opParameters).then().catch(e => {
          console.log(e)
        })
        const cmfModel = new CustomerMoneyFlow()
        const cmfParams = cmfModel.setParams(parameters)
        cmfParams.oncreditId = oncreditId
        cmfModel.create(cmfParams).then()
        e.reply('oncreditCreate', {
          status: true,
          oncreditId: oncreditId
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
})

ipcMain.on('/oncredit/list', (e, form) => {
  const model = new Oncredit()
  const dbResult = model.get(form)
  dbResult
    .then(result => {
      e.reply('oncreditList', result)
    })
    .catch(err => {
      console.log(err)
    })
})

ipcMain.on('/oncredit/print', (e, data) => {
  const model = new Oncredit()
  model.get(data).then(dataset => {
    const branchId = dataset[0].branchId
    const branch = new Branch()
    branch.get({ branchId }).then(branch => {
      const branchInfo = branch[0]
      escpos.Network = escpostNetwork
      const device = new escpos.Network(branchInfo.pumpPrinterIP)
      const options = { encoding: 'cp857' }
      const printer = new escpos.Printer(device, options)
      device.open(function (error) {
        if (error) {
          console.log(error)
          e.reply('printResult', { status: false })
          return false
        }
        const divider = '------------------------------------------------'
        const logo = path.join('../../../public/src/img/branch-logo.png')
        escpos.Image.load(logo, function (image) {
          printer.align('ct')
            .image(image, 's8')
          // .image(image, 'd8')
          // .image(image, 's24')
          // .image(image, 'd24')
          // .raster(image)
          // .raster(image, 'dw')
          // .raster(image, 'dh')
          // .raster(image, 'dwdh')
        })
        printer
          .align('ct')
          .font('a')
          .align('ct')
          .style('b')
          .size(1, 1)
          .text(_.toUpper(branchInfo.name))
          .style('normal')
          .size(0, 0)
          .text('')
          .style('b')
          .text('..::VERESiYE FiŞi::..')
          .style('normal')
          .text('')
          .text(moment().format('DD.MM.YYYY HH:mm') + ' - Fiş No: ' + data.oncreditId)
          .text(divider)
          .align('lt')
          .text('Sayın: ' + _.toUpper(dataset[0].customerName))
          .text('Plaka No: ' + dataset[0].plate)
          .text('Şoför Adı: ' + dataset[0].driverName)
          .text('Tel: ')
          .text('T.C:')
          .text(divider)
          .size(0, 0)
          .align('ct')
        printer.tableCustom([
          {
            text: 'URUN',
            align: 'LEFT',
            width: 0.4,
            style: 'bu'
          },
          {
            text: 'B.FiYATI',
            align: 'LEFT',
            width: 0.3,
            style: 'bu'
          },
          {
            text: 'LiTRE',
            align: 'LEFT',
            width: 0.2,
            style: 'bu'
          },
          {
            text: 'TUTAR',
            align: 'RIGHT',
            width: 0.2,
            style: 'bu'
          }
        ])
        for (const product of dataset) {
          const amount = product.amount ? product.amount : 1
          printer.tableCustom([
            {
              text: product.productName ? product.productName : 'Diğer',
              align: 'LEFT',
              width: 0.4
            },
            {
              text: product.price,
              align: 'LEFT',
              width: 0.3
            },
            {
              text: amount,
              align: 'LEFT',
              width: 0.2
            },
            {
              text: product.subTotal.toFixed(2),
              align: 'RIGHT',
              width: 0.2
            }
          ])
        }
        dataset[0].description = dataset[0].description ? ('Açıklama: ' + dataset[0].description) : 'Açıklama girilmedi.'
        printer
          .text(divider)
          .text(dataset[0].description)
          .text(divider)
          .text('Yalnız ' + Helper.priceToString(dataset[0].totalPrice.toFixed(2)))
          .text('')
          .align('ct')
          .size(1, 1)
          .text('TOPLAM: ' + dataset[0].totalPrice.toFixed(2) + ' TL')
          .size(0, 0)
          .text('')
          .text(divider)
          .align('lt')
          .text('İşbu muhteviyatının tamamını aldım. Bedeli olan ' + Helper.priceToString(dataset[0].totalPrice.toFixed(2)) + ' borcumdur. .... günde ödenmediği takdirde ithilaf vukuunda T.C. Mahkeme ve İcra Dairelerinin selahiyetini şimdiden kabul ve taahhüt ederim.')
          .text(divider)
          .align('ct')
          .text('Teslim Eden:')
          .text(_.toUpper(dataset[0].salesofficerName))
          .text('Teslim Alan:')
          .text(_.toUpper(dataset[0].driverName))
          .text('(iMZA)')
          .text('')
          .text('')
          .align('ct')
          .qrimage('bilexi.com', function (err) {
            this.text('bilexi.com')
            this.text('')
            this.cut()
            // this.beep(3, 2)
            this.close()
            if (err) {
              e.reply('printResult', { status: false })
              console.log(err)
            }
          })
      })
    })
  })
})
