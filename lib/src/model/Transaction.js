import Database from './Database'
import _ from 'lodash'
import moment from 'moment'

export default class Transaction {
  constructor () {
    const dbObj = new Database()
    this.db = dbObj.connect()
  }

  get (form) {
    return this.db('transaction')
      .select('*')
      .where('branchId', form.branchId.toString())
  }

  create (form) {
    return this.db('transaction').insert(form)
  }

  static validate (form) {
    const errors = {}

    if (_.isEmpty(form.companyId)) {
      errors.company = 'Kritik hata, müşteri bulunamadı.'
    }

    if (_.isEmpty(form.branchId)) {
      errors.company = 'Kritik hata, şube bilgisi bulunamadı.'
    }

    if (_.isEmpty(form.salesofficerId)) {
      errors.company = 'Kritik hata, satış görevlisi kimliği bulunamadı.'
    }

    if (_.isEmpty(form.customerId)) {
      errors.customer = 'Bu alan zorunludur. '
    }

    if (_.isEmpty(form.plate)) {
      errors.plate = 'Bu alan zorunludur. '
    }

    return {
      status: Object.keys(errors).length === 0,
      errors
    }
  }

  static setParams (form) {
    return {
      companyId: form.companyId || null,
      branchId: form.branchId || null,
      eventId: 'oncredit',
      customerId: form.slip.customer && form.slip.customer.id ? form.slip.customer.id : null,
      amount: _.sumBy(form.products, 'price'),
      currencyId: 1,
      description: form.slip.description || null,
      creatorId: form.salesofficerId || null,
      createDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
