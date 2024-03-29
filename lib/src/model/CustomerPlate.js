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
        .leftJoin('oncredit', 'customerPlate.id', 'oncredit.customerPlateId')
        .leftJoin('customerDriver', 'customerDriver.id', 'oncredit.customerDriverId')
        // .max('oncredit.id') dostum burasından dolayı sadece tek plaka geliyordu sildim
        .select(
          'customerPlate.plate',
          'customerPlate.id',
          'customer.id as customerId',
          'customer.name as customerName',
          'customer.oncreditDisabled as customerOncreditDisabled',
          'customer.forwardPriceDiscount as customerDiscount',
          'customerDriver.name as customerDriverName',
          'customerDriver.id as customerDriverId',
          'customerDriver.taxNumber as customerDriverTaxNumber'
        )
        .where('customerPlate.isDeleted', 0)
        .groupBy('customerPlate.id')
        .limit(30)

    if (form.plate && !_.isEmpty(form.plate)) {
      q.where('plate', 'like', form.plate.concat('%'))
    }

    if (form.customerId && !isNaN(form.customerId)) {
      q.where('customer.id', form.customerId)
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
