const waitForCouchdb = require('./lib/wait_for_couchdb')
const initDbs = require('./lib/init_dbs')

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

module.exports = async (dbBaseUrl, dbsList, designDocFolder) => {
  if (!/^https?:\/\/[\w-]+:[^@]+@.+/.test(dbBaseUrl)) {
    throw new Error('expected a db url with username and password')
  }

  if (typeof designDocFolder !== 'string') {
    throw new Error('expected an string as designDocFolder path')
  }

  if (!(dbsList instanceof Array)) {
    throw new Error('expected dbsList to be an array')
  }

  await waitForCouchdb(dbBaseUrl)

  return initDbs(dbBaseUrl, dbsList, designDocFolder)
}
