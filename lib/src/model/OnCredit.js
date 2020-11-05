import Database from './Database'
import _ from 'lodash'
import moment from 'moment'

export default class OnCredit {
  constructor () {
    const dbObj = new Database()
    this.db = dbObj.connect()
  }

  get (form) {
    const q = this.db('oncreditProduct')
      .leftJoin('oncredit', 'oncredit.id', 'oncreditProduct.oncreditId')
      .leftJoin('customer', 'customer.id', 'oncredit.customerId')
      .leftJoin('customerDriver', 'customerDriver.id', 'oncredit.customerDriverId')
      .leftJoin('customerPlate', 'customerPlate.id', 'oncredit.customerPlateId')
      .select(
        'oncredit.description',
        'oncredit.sms',
        'oncredit.totalPrice',
        'customer.name as customerName',
        'customerDriver.name as driverName',
        'customerPlate.plate'
      )
      .groupBy('oncredit.id')
      .where('oncredit.branchId', form.branchId.toString())
      .orderBy('oncredit.id', 'desc')

    if (!_.isEmpty(form.customerId)) {
      q.where('oncredit.customerId', form.customerId.toString())
    }

    return q
  }

  create (form) {
    return this.db('oncredit').insert(form)
  }

  static validate (form, products) {
    const errors = {}

    if (_.isEmpty(form.customerId)) {
      errors.company = 'Kritik hata, müşteri bulunamadı.'
    }

    if (_.isEmpty(form.branchId)) {
      errors.company = 'Kritik hata, şube bilgisi bulunamadı.'
    }

    if (_.isEmpty(form.salesofficerId)) {
      errors.company = 'Kritik hata, satış görevlisi kimliği bulunamadı.'
    }

    if (_.isEmpty(form.customerPlateId)) {
      errors.company = 'Plaka bilgisi zorunludur.'
    }

    if (_.isEmpty(form.customerDriverId)) {
      errors.company = 'Şoför bilgisi zorunludur.'
    }

    if (_.isEmpty(products)) {
      errors.company = 'Ürün seçimi yapılmadı.'
    }

    return {
      status: Object.keys(errors).length === 0,
      errors
    }
  }

  static setParams (form) {
    return {
      branchId: form.branchId || null,
      customerId: form.customer.id || null,
      salesOfficerId: form.salesofficerId || null,
      customerPlateId: form.plateId || null,
      customerDriverId: form.driverId || null,
      description: form.description || null,
      sms: form.sms || '0',
      totalPrice: form.totalPrice || '0',
      createDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
