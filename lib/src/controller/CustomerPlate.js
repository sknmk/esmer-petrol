import { ipcMain } from 'electron'
import CustomerPlate from '../model/CustomerPlate'

ipcMain.on('/plate/list', (e, form) => {
  const model = new CustomerPlate()
  const dbResult = model.get(form)
  console.log(dbResult.toString())
  dbResult
    .then(result => {
      e.reply('plateList', result)
    })
    .catch(err => {
      console.log(err)
    })
})

ipcMain.on('/plate/create', (e, form) => {
  const pModel = new CustomerPlate()
  const pParameters = CustomerPlate.setParams(form)
  pModel.create(pParameters)
    .then(plateId => {
      e.returnValue = plateId
    })
    .catch(err => {
      console.error(err)
    })
})
