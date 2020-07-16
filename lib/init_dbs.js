const promiseProps = require('./promise_props')

module.exports = async (dbBaseUrl, dbsList, designDocFolder) => {
  const initDb = require('./init_db')(dbBaseUrl, designDocFolder)

  try {
    const operations = await promiseProps(dbsList.reduce(aggregateInitDb(initDb), {}))
    return { ok: true, operations }
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
