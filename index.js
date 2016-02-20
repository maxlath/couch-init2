const _ = require('inv-loggers')
const bluebird = require('bluebird')

// dbsList = [
//    {
//      name: 'dbname',
//      designDocs: ['designdoc1', 'designdoc2']
//    }
//  ]

// designDocFolder = path to the folder where design docs can be found on the model `${designDocName}.json`.
// Make sure design docs files don't have a _rev attribute

// nano = require('nano-blue')(yourDbUrlIncludingAuth)

module.exports = function (dbsList, designDocFolder, nano) {
  var msg
  if (!(typeof nano.use === 'function')) {
    msg = 'expected an initialized nano-blue object'
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

  const initDb = require('./lib/init_db')(nano, designDocFolder)

  return bluebird.all(dbsList.map(initDb))
  .then((res) => {ok: true})
  .catch(_.ErrorRethrow('db init err'))
}
