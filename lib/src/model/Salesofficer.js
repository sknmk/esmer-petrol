import Database from './Database'

export default class Salesofficer {
  constructor () {
    const dbObj = new Database()
    this.db = dbObj.connect()
  }

  get (form) {
    return this.db('salesofficer')
      .select('*')
      .where('branchId', form.branchId.toString())
      .where('isDeleted', 0)
  }
}
