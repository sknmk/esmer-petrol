import Database from './Database'
import _ from 'lodash'

export default class Customer {
  constructor () {
    const dbObj = new Database()
    this.db = dbObj.connect()
  }

  get (form) {
    const q = this.db('customer')
      .select('*')
      .where('isDeleted', 0)
      .where('companyId', form.companyId.toString())
      .limit(30)

    if (_.has(form, 'name')) {
      q.where('name', 'like', form.name.concat('%'))
    }

    return q
  }
}
