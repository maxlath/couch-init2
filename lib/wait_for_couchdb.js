const fetch = require('node-fetch')
const { name: packageName } = require('../package.json')
const { yellow } = require('tiny-chalk')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = dbBaseUrl => {
  const testAvailability = async delay => {
    await wait(delay)

    try {
      const res = await fetch(dbBaseUrl, { timeout: 5000 })
      if (res.status !== 200) throw new Error(`${res.status}: ${res.statusText}`)
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
