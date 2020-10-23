import { ipcMain } from 'electron'
import Oncredit from '../model/Oncredit'
import OncreditProduct from '../model/OncreditProduct'

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
