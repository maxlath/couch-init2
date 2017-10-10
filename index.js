const _ = require('inv-loggers')
const bluebird = require('bluebird')

// example:

// dbBaseUrl = 'http://username:password@localhost:5984'

// dbsList = [
//    {
//      name: 'dbname',
//      designDocs: [ 'designdoc1', 'designdoc2' ]
//    }
//  ]

// designDocFolder = path to the folder where design docs can be found on the model `${designDocName}.json`.
// Make sure design docs files don't have a _rev attribute

module.exports = function (dbBaseUrl, dbsList, designDocFolder) {
  var msg
  if (!/^https?:\/\/[\w-]+:[^@]+@.+/.test(dbBaseUrl)) {
    msg = 'expected a db url with username and password'
    return bluebird.reject(new Error(msg))
  }
  if (!(typeof designDocFolder === 'string')) {
    msg = 'expected an string as designDocFolder path'
    return bluebird.reject(new Error(msg))
  }
  if (!(dbsList instanceof Array)) {
    msg = 'expected dbsList to be an array'
    return bluebird.reject(new Error(msg))
  }

  const initDb = require('./lib/init_db')(dbBaseUrl, designDocFolder)

  return bluebird.all(dbsList.map(initDb))
  .then(res => ({ ok: true }))
  .catch(err => {
    if (err.message === 'Name or password is incorrect.') {
      throw new Error('CouchDB name or password is incorrect')
    } else {
      throw err
    }
  })
}
