import { ipcMain } from 'electron'
import _ from 'lodash'
import moment from 'moment'
import Oncredit from '../model/OnCredit'
import OncreditProduct from '../model/OncreditProduct'
import CustomerMoneyFlow from '../model/CustomerMoneyFlow'
import Helper from './Helper'
import Branch from '../model/Branch'
import escpos from 'escpos'
import escposUsb from 'escpos-usb'
import escpostNetwork from 'escpos-network'
import path from 'path'

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
      const countProduct = form.products.length
      for (const i in form.products) {
        const opModel = new OncreditProduct()
        const opParameters = OncreditProduct.setParams(form.products[i], oncreditId)
        const opValidation = OncreditProduct.validate(opParameters, i)
        if (!opValidation.status) {
          e.reply('oncreditCreate', opValidation)
        } else {
          opModel.create(opParameters).then(response => {
            if (parseInt(i) === countProduct - 1) {
              e.reply('oncreditCreate', {
                status: true,
                oncreditId: oncreditId
              })
            }
          }).catch(e => {
            console.log(e)
          })
        }
      }
      const cmfModel = new CustomerMoneyFlow()
      const cmfParams = cmfModel.setParams(parameters)
      cmfParams.oncreditId = oncreditId
      cmfModel.create(cmfParams).then(cmfResponse => {
        console.log(cmfResponse)
      })
    })
    .catch(err => {
      console.log(err)
    })
})

ipcMain.on('/oncredit/list', (e, form) => {
  const model = new Oncredit()
  const dbResult = model.get(form, 5)
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
      data.copy = data.copy || branchInfo.pumpPrinterCopy
      const options = { encoding: 'cp857' }
      let i
      for (i = 1; i <= data.copy; i++) {
        let device
        if (branchInfo.pumpPrinterIP) {
          escpos.Network = escpostNetwork
          device = new escpos.Network(branchInfo.pumpPrinterIP)
        } else {
          escpos.USB = escposUsb
          device = new escpos.USB(branchInfo.pumpPrinterVid, branchInfo.pumpPrinterPid)
        }
        const printer = new escpos.Printer(device, options)
        device.open(function (error) {
          if (error) {
            e.reply('printResult', { status: false, description: error })
            return false
          }
          const divider = '------------------------------------------------'
          const logo = path.join(__dirname, path.normalize('../../../public/static/img/branch-logo.png'))
          escpos.Image.load(logo, function (image) {
            printer
              .align('ct')
              .image(image, 'd24')
              .then(() => {
                printer
                  .font('a')
                  .align('ct')
                  .style('b')
                  .size(1, 1)
                  .text(_.toUpper(branchInfo.name))
                  .style('normal')
                  .size(0, 0)
                  .text(branchInfo.phone)
                  .text(branchInfo.address)
                  .text('')
                  .style('b')
                  .text('..::VERESiYE FiŞi::..')
                  .style('normal')
                  .text('')
                  .text(moment().format('DD.MM.YYYY HH:mm') + ' - Fiş No: ' + data.oncreditId)
                  .text(divider)
                  .size(1, 1)
                  .text(_.toUpper(dataset[0].customerName))
                  .size(0, 0)
                  .text(divider)
                  .align('lt')
                  .text('Vergi No: ' + _.toUpper(dataset[0].customerTaxNumber))
                  .text('Gsm: ' + _.toUpper(dataset[0].customerPhone))
                  .text('Adres: ' + _.toUpper(dataset[0].customerAddress))
                  .text('Plaka No: ' + dataset[0].plate)
                  .text('Şoför Adı: ' + dataset[0].driverName)
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
                  .text(branchInfo.receiptAgreement.replace('{tutar}', Helper.priceToString(dataset[0].totalPrice.toFixed(2))))
                  .text(divider)
                  .align('ct')
                  .text('Teslim Eden:')
                  .text(_.toUpper(dataset[0].salesofficerName))
                  .text('Teslim Alan:')
                  .size(1, 1)
                  .text(_.toUpper(dataset[0].driverName))
                  .size(0, 0)
                  .text('(iMZA)')
                  .text('')
                  .text('')
                  .align('ct')
                  .qrimage('bilexi.com', function (err) {
                    this.text('bilexi.com')
                    this.text('')
                    this.cut()
                    if (branchInfo.pumpPrinterVid) {
                      this.beep(1, 2)
                    }
                    this.close()
                    if (err) {
                      e.reply('printResult', { status: false })
                      console.log(err)
                      return false
                    }
                    e.reply('printResult', { status: true })
                  })
              })
              .catch(error => {
                console.log(error)
                e.reply('printResult', { status: false, description: error })
              })
          })
        })
      }
    }).catch(error => {
      console.log(error)
      e.reply('printResult', { status: false, description: error })
    })
  })
})
