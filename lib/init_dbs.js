const bluebird = require('bluebird')

module.exports = (dbBaseUrl, dbsList, designDocFolder) => {
  const initDb = require('./init_db')(dbBaseUrl, designDocFolder)

  return bluebird.props(dbsList.reduce(aggregateInitDb(initDb), {}))
  .then(operations => ({ ok: true, operations }))
  .catch(err => {
    if (err.message === 'Name or password is incorrect.') {
      throw new Error('CouchDB name or password is incorrect')
    } else {
      throw err
    }
  })
}

const aggregateInitDb = initDb => (index, dbData) => {
  index[dbData.name] = initDb(dbData)
  return index
}
