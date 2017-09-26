const _ = require('inv-loggers')
const bluebird = require('bluebird')
const nanoBlue = require('nano-blue2')

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

  const nano = nanoBlue(dbBaseUrl)
  const initDb = require('./lib/init_db')(dbBaseUrl, nano, designDocFolder)

  return bluebird.all(dbsList.map(initDb))
  .then(res => ({ ok: true }))
  .catch(_.ErrorRethrow('db init err'))
}
