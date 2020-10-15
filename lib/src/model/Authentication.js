import Database from './Database'
import bcrypt from 'bcrypt'
import moment from 'moment'

export default class Authentication {
    constructor() {
        let dbObj = new Database();
        this.db = dbObj.connect()
    }

    login(form) {
        return this.db('branch')
            .update(
                {
                    lastLoginDate: moment().format('YYYY-MM-DD HH:mm:ss'),
                    failedAttempt: '0',
                    status: '1'
                }
            )
            .where('id', form[0].id)
    }

    getAuthenticator(form) {
        return this.db('branch')
            .select('*')
            .where({id: form.id})
            .limit(1)
    }

    getAuthenticators() {
        return this.db('branch').select('*')
    }

    fail(form) {
        return this.db('branch')
            .increment('failedAttempt', 1)
            .where('id', form.id)
    }

    validate(form, dbResult) {
        let errors = {}

        if (Object.keys(dbResult).length < 1) {
            errors.branch = 'Geçersiz şube.'
        } else {
            dbResult = dbResult[0]
            if (dbResult.failedAttempt > 5 || dbResult.status === '0') {
                errors.general = 'Hesabınız bloke edildi.'
            }
            if (!bcrypt.compareSync(form.password, dbResult.password)) {
                errors.password = 'Geçersiz şifre.'
            }
        }

        return {
            status: Object.keys(errors).length === 0,
            errors: errors
        }
    }

    setParams(params) {
        return {
            id: params.id && params.id.id || '',
            password: params.password && params.password.trim() || '',
        }
    }
}
