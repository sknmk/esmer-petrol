import { ipcMain } from 'electron'
import Transaction from '../model/Transaction'
import CustomerPlate from '../model/CustomerPlate'

ipcMain.on('/oncredit/create', (e, form) => {
  const parameters = Transaction.setParams(form)
  const validation = Transaction.validate(parameters)
  if (!validation.status) {
    e.reply('oncreditCreate', validation)
  }
  const model = new Transaction()
  model.create(parameters)
    .then(rowId => {
      if (parameters.plateId === 'new') {
        new CustomerPlate()
          .create({ companyId: parameters.companyId, customerId: parameters.customerId, plate: parameters.plate })
          .then()
      }
      e.reply('oncreditCreate', { status: true, description: rowId })
    })
    .catch(err => {
      console.log(err)
    })
})
