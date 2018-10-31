const bluebird = require('bluebird')
const nanoBlue = require('nano-blue2')
const { name: packageName } = require('../package.json')
const { yellow } = require('chalk')

module.exports = dbBaseUrl => {
  const nano = nanoBlue(dbBaseUrl)

  const testAvailability = delay => {
    return bluebird.resolve()
    .delay(delay)
    .then(() => nano.db.list())
    .timeout(1000)
    .catch(err => {
      if (err.name === 'TimeoutError' || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
        const warningMessage = yellow(`[${packageName}] waiting for CouchDB on`)
        console.warn(warningMessage, obfuscateLogin(dbBaseUrl))
        return testAvailability(500)
      } else {
        throw err
      }
    })
  }

  return testAvailability(0)
}

const obfuscateLogin = dbBaseUrl => {
  return dbBaseUrl
  .replace(/(https?):\/\/(\w+):([^@]+)@/, '$1://$2:*************@')
}
