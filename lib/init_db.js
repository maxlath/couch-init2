const _ = require('inv-loggers')
const bluebird = require('bluebird')
const putSecurityDoc = require('./put_security_doc')

module.exports = function (dbBaseUrl, nano, designDocFolder) {
  const initDb = function (dbData) {
    // _.log(dbData, 'initDb')
    const dbName = dbData.name
    const designDocs = dbData.designDocs
    const db = nano.use(dbName)
    const syncDesignDocs = require('./sync_design_docs')(designDocFolder)

    return ensureDbExistance(dbName, db)
    .then(function () {
      return bluebird.all([
        syncDesignDocs(db, designDocs),
        putSecurityDoc(db, dbBaseUrl, dbName)
      ])
    })
  }

  const ensureDbExistance = function (dbName, db) {
    return db.info()
    .then((res) => _.success(`${dbName} database: exist`))
    .catch(Create(dbName))
    .catch(_.ErrorRethrow('ensureDbExistance'))
  }

  const Create = function (dbName) {
    return function (err) {
      if (err.statusCode === 404) {
        return nano.db.create(dbName)
          .then(_.Log(`${dbName} database: created`))
      } else {
        throw err
      }
    }
  }

  return initDb
}
