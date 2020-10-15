import { ipcMain } from 'electron'
import Salesofficer from '../model/Salesofficer'

ipcMain.on('/salesofficer/list', (e, form) => {
  const model = new Salesofficer()
  const dbResult = model.get(form)
  dbResult.then(result => {
    e.reply('salesofficerList', result)
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
