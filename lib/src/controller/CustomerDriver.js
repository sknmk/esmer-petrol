import { ipcMain } from 'electron'
import CustomerDriver from '../model/CustomerDriver'

ipcMain.on('/driver/list', (e, form) => {
  const model = new CustomerDriver()
  const dbResult = model.get(form)
  dbResult
    .then(result => {
      e.reply('driverList', result)
    })
    .catch(err => {
      console.error(err)
    })
})

ipcMain.on('/driver/create', (e, form) => {
  const dModel = new CustomerDriver()
  const dParameters = CustomerDriver.setParams(form)
  dModel.create(dParameters)
    .then(driverId => {
      e.returnValue = driverId
    })
    .catch(err => {
      console.error(err)
    })
})
