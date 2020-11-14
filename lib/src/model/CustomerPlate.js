import Database from './Database'
import _ from 'lodash'
import moment from 'moment'

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
        .limit(30)

    if (form.plate && !_.isEmpty(form.plate)) {
      q.where('plate', 'like', form.plate.concat('%'))
    }

    if (form.customerId && !isNaN(form.customerId)) {
      q.where('customerId', form.customerId)
    }

    return q
  }

  create (form) {
    return this.db('customerPlate').insert(form)
  }

  static setParams (form) {
    return {
      customerId: form.customerId || null,
      plate: form.plate || null,
      insertDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
