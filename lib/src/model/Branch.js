import Database from './Database'
import _ from 'lodash'

export default class Branch {
  constructor () {
    const dbObj = new Database()
    this.db = dbObj.connect()
  }

  get (form) {
    const q = this.db('branch')
      .select('*')
      .where('status', 1)
      .limit(1)

    if (_.has(form, 'branchId')) {
      q.where('id', parseInt(form.branchId))
    }

    return q
  }
}
