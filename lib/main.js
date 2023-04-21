import { initDbs } from './init_dbs.js'
import { waitForCouchdb } from './wait_for_couchdb.js'

/**
 * @typedef { import('./types.d.ts').Url } Url
 * @typedef { import('./types.d.ts').DatabaseConfig } DatabaseConfig
 * @typedef { import('./types.d.ts').FolderPath } FolderPath
 * @typedef { import('./types.d.ts').OperationsSummary } OperationsSummary
 */

/**
 * @param {Url} dbHostUrlWithAuth - ex: 'http://username:password@localhost:5984'
 * @param {DatabaseConfig[]} dbsList - ex: [ { name: 'dbname', designDocs: [ 'designdoc1', 'designdoc2' ] } ]
 * @param {FolderPath} designDocFolder - Path to the folder where design docs can be found on the model `${designDocName}.json`. Make sure design docs files don't have a _rev attribute.
 */
async function couchInit (dbHostUrlWithAuth, dbsList, designDocFolder) {
  if (!/^https?:\/\/[\w-]+:[^@]+@.+/.test(dbHostUrlWithAuth)) {
    throw new Error('expected a db url with username and password')
  }

  if (typeof designDocFolder !== 'string') {
    throw new Error('expected an string as designDocFolder path')
  }

  if (!(dbsList instanceof Array)) {
    throw new Error('expected dbsList to be an array')
  }

  await waitForCouchdb(dbHostUrlWithAuth)

  return initDbs(dbHostUrlWithAuth, dbsList, designDocFolder)
}

export default couchInit
