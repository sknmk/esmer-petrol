import Database from './Database'
import moment from 'moment'

export default class CustomerMoneyFlow {
  constructor () {
    const dbObj = new Database()
    this.db = dbObj.connect()
  }

  create (form) {
    form.createDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    return this.db('customerMoneyFlow').insert(form)
  }

  setParams (form) {
    return {
      customerId: form.customerId,
      branchId: form.branchId,
      oncreditId: form.oncreditId,
      amount: form.amount,
      paymentType: form.paymentType || 0,
      description: form.description,
      creatorId: form.salesOfficerId,
      createDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
