import { InitDb } from './init_db.js'
import { objectPromise } from './promise_props.js'

/**
 * @typedef { import('./types.d.ts').Url } Url
 * @typedef { import('./types.d.ts').DatabaseConfig } DatabaseConfig
 * @typedef { import('./types.d.ts').FolderPath } FolderPath
 * @typedef { import('./types.d.ts').OperationsSummary } OperationsSummary
 */

/**
 * @param {Url} dbBaseUrl
 * @param {DatabaseConfig[]} dbsList
 * @param {FolderPath} designDocFolder
 */
export async function initDbs (dbBaseUrl, dbsList, designDocFolder) {
  const initDb = InitDb(dbBaseUrl, designDocFolder)

  try {
    const operations = await objectPromise(dbsList.reduce(aggregateInitDb(initDb), {}))
    return { ok: true, operations: minimzeOperationsReport(operations) }
  } catch (err) {
    if (err.message === 'Name or password is incorrect.') {
      throw new Error('CouchDB name or password is incorrect')
    } else {
      throw err
    }
  }
};

const aggregateInitDb = initDb => (index, dbData) => {
  index[dbData.name] = initDb(dbData)
  return index
}

/**
 * @param {any} operations
 */
function minimzeOperationsReport (operations) {
  const minimized = /** @type {OperationsSummary}  */ ({})
  for (const [ dbName, { created, designDocs, securityDoc } ] of Object.entries(operations)) {
    let dbHasOp = created
    minimized[dbName] = { created }
    for (let [ designDocName, { created, updated } ] of Object.entries(designDocs)) {
      designDocName = designDocName.replace(/\.js$/, '')
      if (created || updated) {
        dbHasOp = true
        minimized[dbName].designDocs = minimized[dbName].designDocs || {}
        if (created) minimized[dbName].designDocs[designDocName] = { created }
        if (updated) minimized[dbName].designDocs[designDocName] = { updated }
      }
    }
    if (securityDoc.created) {
      dbHasOp = true
      minimized[dbName].securityDoc = securityDoc
    }
    if (!dbHasOp) delete minimized[dbName]
  }
  return minimized
}
