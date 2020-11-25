import Database from './Database'
import _ from 'lodash'

export default class Product {
  constructor () {
    const dbObj = new Database()
    this.db = dbObj.connect()
  }

  get (form) {
    const dbHandler = this.db
    const q = this.db('product as p')
      .select('p.*')
      .select('cp.salePrice as specialSalePrice')
      .leftJoin('customerProductPrice as cp', function () {
        this.on(function () {
          this.on('cp.productId', '=', 'p.id')
          this.andOn(dbHandler.raw('(cp.customerId = ? and cp.isDeleted = 0)', [form.customerId]))
        })
      })
      .where('p.branchId', form.branchId.toString())
      .where('p.status', 1)
      .where('p.onCredit', 1)
    const fields = ['p.id', 'p.name']
    const price = !form.discount || isNaN(form.discount) || form.discount > 50
      ? 'p.salePrice'
      : { salePrice: this.db.raw('p.salePrice * (1 - ' + form.discount + ' / 100)') }
    fields.push(price)
    q.column(fields)
    console.log(q.toString())
    return q
  }
}
