import { ipcMain } from 'electron'
import Customer from '../model/Customer'

ipcMain.on('/customer/list', (e, form) => {
  const model = new Customer()
  const dbResult = model.get(form)
  dbResult.then(result => {
    e.reply('customerList', result)
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
