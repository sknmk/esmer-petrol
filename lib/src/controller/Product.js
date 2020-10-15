import { ipcMain } from 'electron'
import Product from '../model/Product'

ipcMain.on('/product/list', (e, form) => {
  const model = new Product()
  const dbResult = model.get(form)
  dbResult.then(result => {
    e.reply('productList', result)
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
