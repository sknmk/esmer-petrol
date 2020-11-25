import Database from './Database'
import moment from 'moment'

export default class OncreditProduct {
  constructor () {
    const dbObj = new Database()
    this.db = dbObj.connect()
  }

  get (form) {
    return this.db('oncreditProduct')
      .select('*')
      .where('oncreditId', form.oncreditId.toString())
  }

  create (form) {
    return this.db('oncreditProduct').insert(form)
  }

  static validate (form, i) {
    const errors = []
    if (isNaN(form.oncreditId)) {
      errors[i].oncreditId = 'Kritik hata. Veresiye form bilgisi hatalı.'
    }

    return {
      status: Object.keys(errors).length === 0,
      errors
    }
  }

  static setParams (form, oncreditId) {
    let params
    if (form.id === 'other') {
      params = {
        oncreditId: oncreditId || null,
        productId: null,
        price: form.price || null,
        amount: 1,
        subtotal: form.price || null,
        createDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
    } else {
      params = {
        oncreditId: oncreditId || null,
        productId: form.id || null,
        price: form.salePrice || null,
        amount: form.liter || null,
        subtotal: form.price || null,
        createDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
    }
    return params
  }
}
