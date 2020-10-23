import Database from './Database'
import moment from 'moment'
import _ from 'lodash'

export default class CustomerDriver {
  constructor () {
    const dbObj = new Database()
    this.db = dbObj.connect()
  }

  get (form) {
    const q = this.db('customerDriver')
      .select('*')
      .where('customerId', form.customerId.toString())
      .where('isDeleted', 0)

    if (_.has(form, 'name')) {
      q.where('name', 'like', form.name.concat('%'))
    }

    return q
  }

  create (form) {
    return this.db('customerDriver').insert(form)
  }

  static validate (form) {
    const errors = {}
    if (_.isEmpty(form.customerId) || isNaN(form.customerId)) {
      errors.customerId = 'Kritik hata. Müşteri bilgisi hatalı.'
    }
    if (_.isEmpty(form.name) || form.name.length < 4) {
      errors.customerId = 'Şoför ismi 4 karakterden büyük olmalıdır.'
    }
    return {
      status: Object.keys(errors).length === 0,
      errors
    }
  }

  static setParams (form) {
    return {
      customerId: form.customerId || null,
      name: form.driver || null,
      insertDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}