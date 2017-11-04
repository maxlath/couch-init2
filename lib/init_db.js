const _ = require('inv-loggers')
const bluebird = require('bluebird')
const putSecurityDoc = require('./put_security_doc')
const nanoBlue = require('nano-blue2')

module.exports = function (dbBaseUrl, designDocFolder) {
  const nano = nanoBlue(dbBaseUrl)
  return function (dbData) {
    const dbName = dbData.name
    const designDocs = dbData.designDocs
    const db = nano.use(dbName)
    const syncDesignDocs = require('./sync_design_docs')(designDocFolder)

    return ensureDbExistance(nano, db, dbName)
    .tap(function () {
      return bluebird.all([
        syncDesignDocs(db, designDocs),
        putSecurityDoc(db, dbBaseUrl, dbName)
      ])
    })
  }
}

const ensureDbExistance = function (nano, db, dbName) {
  return db.info()
  .then(res => {
    _.success(`${dbName} database: exist`)
    return { created: false }
  })
  .catch(create(nano, dbName))
}

const create = (nano, dbName) => err => {
  if (err.statusCode !== 404) throw err
  return nano.db.create(dbName)
  .then(_.Log(`${dbName} database: created`))
  .then(() => ({ created: true }))
}
