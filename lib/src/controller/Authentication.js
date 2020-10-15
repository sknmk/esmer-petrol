import { ipcMain } from 'electron'
import Authentication from '../model/Authentication'

ipcMain.on('/auth', (e, data) => {
  const authObj = new Authentication()
  const form = authObj.setParams(data)
  const dbResult = authObj.getAuthenticator(form)
  dbResult.then(result => {
    const validationResult = authObj.validate(form, result)
    if (!validationResult.status) {
      authObj.fail(form).then()
      e.reply('authResult', validationResult)
      return false
    }
    authObj.login(result).then()
    e.reply('authResult', {
      status: true,
      branchDetails: result
    })

    return false
  }).catch(err => {
    console.log(err)
    e.returnValue = {
      status: false,
      errors: { general: 'Kullanıcı bulunamadı.' }
    }
    return false
  })
})

ipcMain.on('/auth/list', (e) => {
  const authObj = new Authentication()
  const dbResult = authObj.getAuthenticators()
  dbResult.then(result => {
    e.returnValue = { result }
    return false
  }).catch(err => {
    console.log(err)
    e.returnValue = {
      status: false,
      errors: { general: 'Hiç şube bulunamadı.' }
    }
    return false
  })
})
