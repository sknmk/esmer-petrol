import { ipcMain } from 'electron'
import CustomerPlate from '../model/CustomerPlate'

ipcMain.on('/plate/list', (e, form) => {
  const model = new CustomerPlate()
  const dbResult = model.get(form)
  dbResult.then(result => {
    e.reply('plateList', result)
    return false
  }).catch(err => {
    console.log(err)
    e.returnValue = {
      status: false,
      errors: { general: 'Kritik hata.' }
    }
    return false
  })
})
