import Database from './Database'
import _ from 'lodash'

export default class CustomerPlate {
  constructor () {
    const dbObj = new Database()
    this.db = dbObj.connect()
  }

  get (form) {
    const q =
      this.db('customerPlate')
        .leftJoin('customer', 'customer.id', 'customerPlate.customerId')
        .select(
          'customerPlate.plate',
          'customerPlate.id',
          'customer.id as customerId',
          'customer.name as customerName',
          'customer.forwardPriceDiscount as customerDiscount'
        )
        .where('customerPlate.isDeleted', 0)
        .where('customerPlate.companyId', form.companyId.toString())
        .limit(30)

    if (_.has(form, 'plate')) {
      q.where('plate', 'like', form.name.concat('%'))
    }

    return q
  }

  create (form) {
    return this.db('customerPlate').insert(form)
  }

  validate (form) {
    const errors = {}
    const val = form.plate
    const v = _.upperCase(val.replace(/\s+/g, ''))
    const regex = /^(0[1–9]|[1–7][0–9]|8[01])(([A-Z])(\d{4,5})|([A-Z]{2})(\d{3,4})|([A-Z]{3})(\d{2,3}))$/
    if (v.match(regex) == null) {
      errors.plate = 'Plaka formatı hatalı.'
    }

    return {
      status: Object.keys(errors).length === 0,
      errors
    }
  }
}
