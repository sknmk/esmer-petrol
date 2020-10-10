import Database from "./Database"
import bcrypt from "bcrypt"
import moment from "moment"

export default class Authentication {
    constructor() {
        let dbObj = new Database();
        this.db = dbObj.connect()
    }

    login(form) {
        return this.db("user")
            .update({lastLoginDate: moment().format("YYYY-MM-DD HH:mm:ss"), failedAttempt: "0", status: "1"})
            .where("id", form[0].id)
    }

    getUser(form) {
        return this.db("user").select("*").where({username: form.username}).limit(1)
    }

    fail(form) {
        return this.db("user")
            .increment("failedAttempt", 1)
            .where("username", form.username)
    }

    validate(form, dbResult) {
        let exception = {}

        if (form.username.length < 4 || Object.keys(dbResult).length < 1) {
            exception.username = "Geçersiz kullanıcı adı."
        } else {
            dbResult = dbResult[0]
            if (dbResult.failedAttempt > 5 || dbResult.status === "0") {
                exception.general = "Hesabınız bloke edildi."
            }
            if (!bcrypt.compareSync(form.password, dbResult.password)) {
                exception.password = "Geçersiz şifre."
            }
        }

        return {
            status: Object.keys(exception).length === 0,
            exception: exception
        }
    }

    setParams(params) {
        return {
            username: params.username && params.username.trim() || "",
            password: params.password && params.password.trim() || "",
        }
    }
}