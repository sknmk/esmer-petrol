import knex from 'knex'
import fs from 'fs'
import path from 'path'

export default class Database {
  connect () {
    const credentials = {}
    const credentialPath = path.join(__dirname, path.normalize('../../../lib/dbcredentials.json'))
    const connectionDetails = JSON.parse(fs.readFileSync(credentialPath).toString())
    credentials.client = 'mysql'
    credentials.connection = connectionDetails
    return knex(credentials)
  }

  tryConnect (params) {
    const instance = knex({
      client: 'mysql',
      connection: {
        host: params.host,
        port: params.port,
        user: params.user,
        password: params.password,
        database: params.database
      }
    })

    return instance.select('*').from('user').limit(1)
  }
}
