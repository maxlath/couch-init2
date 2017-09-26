const _ = require('inv-loggers')
const bluebird = require('bluebird')
const putSecurityDoc = require('./put_security_doc')

module.exports = (dbBaseUrl, nano, designDocFolder) => dbData => {
  const dbName = dbData.name
  const designDocs = dbData.designDocs
  const db = nano.use(dbName)
  const syncDesignDocs = require('./sync_design_docs')(designDocFolder)

  return ensureDbExistance(nano, dbName, db)
  .then(function () {
    return bluebird.all([
      syncDesignDocs(db, designDocs),
      putSecurityDoc(db, dbBaseUrl, dbName)
    ])
  })
}

const ensureDbExistance = function (nano, db, dbName) {
  return db.info()
  .then(res => _.success(`${dbName} database: exist`))
  .catch(create(nano, dbName))
  .catch(_.ErrorRethrow('ensureDbExistance'))
}

const create = (nano, dbName) => err => {
  if (err.statusCode !== 404) throw err
  return nano.db.create(dbName)
  .then(_.Log(`${dbName} database: created`))
}
