import knex from "knex"
import fs from "fs"
import path from "path"
import "regenerator-runtime/runtime";

export default class Database {

    connect() {
        let credentials = {},
            credentialPath = path.normalize("./lib/dbcredentials.json"),
            connectionDetails = JSON.parse(fs.readFileSync(credentialPath).toString())
        credentials.client = "mysql"
        credentials.connection = connectionDetails
        return knex(credentials)
    }

    tryConnect(params) {
        let instance = knex({
            client: "mysql",
            connection: {
                host: params.host,
                port: params.port,
                user: params.user,
                password: params.password,
                database: params.database
            }
        });

        return instance.select("*").from("user").limit(1)
    }
}
