import Database from './Database'
import _ from 'lodash'

export default class Product {
  constructor () {
    const dbObj = new Database()
    this.db = dbObj.connect()
  }

  get (form) {
    const q = this.db('product')
      .select()
      .where('branchId', form.branchId.toString())
      .where('status', 1)
      .where('onCredit', 1)
    const fields = ['id', 'name']
    const price = !_.has(form, 'discount') || isNaN(form.discount) || form.discount > 50
      ? 'salePrice'
      : { salePrice: this.db.raw('salePrice * (1 - ' + form.discount + ' / 100)') }
    fields.push(price)
    q.column(fields)

    return q
  }
}
