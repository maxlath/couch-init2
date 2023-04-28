import path from 'node:path'
import fetch from 'node-fetch'
import { yellow } from 'tiny-chalk'
import { getDirname, getJsonSync, wait } from './utils.js'

const dirname = getDirname(import.meta.url)
const { name: packageName } = getJsonSync(path.resolve(dirname, '../package.json'))

export function waitForCouchdb (dbBaseUrl) {
  const testAvailability = async delay => {
    await wait(delay)

    try {
      const res = await fetch(dbBaseUrl, { timeout: 5000 })
      if (res.status === 401) throw new Error('CouchDB name or password is incorrect')
      if (res.status !== 200) throw new Error(`Connexion to CouchDB failed: ${res.status}: ${res.statusText}`)
    } catch (err) {
      if (err.name === 'TimeoutError' || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
        const warningMessage = yellow(`[${packageName}] waiting for CouchDB on`)
        console.warn(warningMessage, obfuscateLogin(dbBaseUrl))
        return testAvailability(500)
      } else {
        throw err
      }
    }
  }

  return testAvailability(0)
}

const obfuscateLogin = dbBaseUrl => {
  return dbBaseUrl
  .replace(/(https?):\/\/(\w+):([^@]+)@/, '$1://$2:*************@')
}
