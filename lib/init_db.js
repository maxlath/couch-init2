const _ = require('inv-loggers')

module.exports = function (nano, designDocFolder) {
  const initDb = function (dbData) {
    _.log(dbData, 'initDb')
    const name = dbData.name
    const designDocs = dbData.designDocs
    const db = nano.use(name)
    const syncDesignDocs = require('./sync_design_docs')(designDocFolder)

    return ensureDbExistance(name, db)
    .then(syncDesignDocs.bind(null, db, designDocs))
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
