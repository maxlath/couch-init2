const promiseProps = require('./promise_props')

module.exports = async (dbBaseUrl, dbsList, designDocFolder) => {
  const initDb = require('./init_db')(dbBaseUrl, designDocFolder)

  try {
    const operations = await promiseProps(dbsList.reduce(aggregateInitDb(initDb), {}))
    return { ok: true, operations: minimzeOperationsReport(operations) }
  } catch (err) {
    if (err.message === 'Name or password is incorrect.') {
      throw new Error('CouchDB name or password is incorrect')
    } else {
      throw err
    }
  }
}

const aggregateInitDb = initDb => (index, dbData) => {
  index[dbData.name] = initDb(dbData)
  return index
}

const minimzeOperationsReport = operations => {
  const minimized = {}
  for (const [ dbName, { created, designDocs, securityDoc } ] of Object.entries(operations)) {
    let dbHasOp = created
    minimized[dbName] = { created }
    for (const [ designDocName, { created, updated } ] of Object.entries(designDocs)) {
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
