import { ipcMain } from 'electron'
import Oncredit from '../model/Oncredit'
import OncreditProduct from '../model/OncreditProduct'
import CustomerMoneyFlow from '../model/CustomerMoneyFlow'
import escpos from 'escpos'
import escpostNetwork from 'escpos-network'

ipcMain.on('/oncredit/create', (e, form) => {
  const model = new Oncredit()
  const parameters = Oncredit.setParams(form)
  const validation = Oncredit.validate(parameters, form.products)
  if (!validation.status) {
    e.reply('oncreditCreate', validation)
  }
  model.create(parameters)
    .then(rowId => {
      for (const i in form.products) {
        const opModel = new OncreditProduct()
        const opParameters = OncreditProduct.setParams(form.products[i], rowId)
        const opValidation = Oncredit.validate(parameters, i)
        if (!opValidation.status) {
          e.reply('oncreditCreate', validation)
        }
        opModel.create(opParameters).then().catch(e => {
          console.log(e)
        })
      }
      const cmfModel = new CustomerMoneyFlow()
      const cmfParams = cmfModel.setParams(parameters)
      cmfParams.oncreditId = rowId
      cmfModel.create(cmfParams).then()
      e.reply('oncreditCreate', {
        status: true,
        description: rowId
      })
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

ipcMain.on('/oncredit/print', (e, form) => {
  escpos.Network = escpostNetwork
  const device = new escpos.Network('192.168.1.222')
  const options = { encoding: 'cp857' }
  const printer = new escpos.Printer(device, options)
  device.open(function (error) {
    if (error) {
      console.log(error)
      e.reply('printResult', { status: false })
    }
    printer
      .font('a')
      .align('ct')
      .style('b')
      .size(1, 1)
      .text(form.branch)
      .style('normal')
      .text('')
      .text('Veresiye  Fişi')
      .text('')
      .text('')
      .size(0, 0)
      .text('ÜRÜNLER')
      .text('________')
      .text('')
    for (const i in form.products) {
      printer.tableCustom([
        {
          text: form.products[i].name,
          align: 'LEFT',
          width: 0.45
        },
        {
          text: form.products[i].price + ' TL',
          align: 'RIGHT',
          width: 0.45,
          style: 'B'
        }
      ])
    }
    printer
      .text('________')
      .text('')
      .style('b')
      .align('ct')
      .size(1, 1)
      .text('TOPLAM: ' + form.totalPrice + ' TL')
      .size(0, 0)
      .align('lt')
      .style('normal')
      .text('')
      .text('Yazıyla: ' + form.totalPriceText)
      .text('')
      .text('Müşteri: ' + form.customer)
      .text('İşlem Yapan: ' + form.salesofficer)
      .text('')
      .text('')
      .align('ct')
      .beep(3, 2)
      .text('bilexi.com')
      .qrimage('bilexi.com', function (err) {
        if (err) {
          e.reply('printResult', { status: false })
          console.log(err)
        }
        this.cut()
        this.close()
      })
  })
})
