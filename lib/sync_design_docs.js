const _ = require('inv-loggers')
const bluebird = require('bluebird')
const fs = require('./fs')

// This verifies that the database design documents are up-to-date
// with the design docs files
module.exports = designDocFolder => (db, designDocs) => {
  return bluebird.all(designDocs.map(syncDesignDoc(designDocFolder, db)))
}

const syncDesignDoc = (designDocFolder, db) => designDocName => {
  const designDocId = `_design/${designDocName}`
  return getDesignDocFile(designDocFolder, designDocName)
  .then(designDocFile => {
    return getCurrentDesignDoc(db, designDocId)
    .then(updateDesignDoc(db, designDocId, designDocFile))
  })
}

const getDesignDocFile = function (designDocFolder, designDocName) {
  const designDocPath = `${designDocFolder}/${designDocName}.json`
  return fs.readFile(designDocPath)
  .catch(err => {
    if (err.code !== 'ENOENT') {
      _.error(err, 'reloadDesignDoc readFile err')
      throw err
    }

    // Initialize the design doc if none is found
    // Return a stringify version to keep consistency
    // with what would the normal readFile
    const initDoc = JSON.stringify(emtpyDesignDoc(designDocName), null, 4)
    // Creating the design doc file but not waiting for its creation
    fs.writeFile(designDocPath, initDoc)
    .then(function () {
      _.log(designDocPath, 'design doc file created')
    })

    return initDoc
  })
}

const getCurrentDesignDoc = function (db, designDocId) {
  return db.get(designDocId)
  .spread((body, header) => body)
  .catch(err => {
    if (err.statusCode !== 404) throw err
    _.info(designDocId, 'design doc not found: creating')
    // pass an empty document to trigger a document update
    return {}
  })
}

const updateDesignDoc = (db, designDocId, designDocFile) => currentDesignDoc => {
  const rev = currentDesignDoc && currentDesignDoc._rev

  // Delete the rev to be able to compare object
  delete currentDesignDoc._rev

  // designDocFile should be a stringified object
  const currentDesignDocStr = JSON.stringify(currentDesignDoc)

  // Comparison is made without spaces to avoid false negative
  if (removeSpaces(designDocFile) === removeSpaces(currentDesignDocStr)) return

  _.info(designDocId, 'updating design doc')
  const update = JSON.parse(designDocFile)
  update._rev = rev

  return db.insert(update)
  .spread(body => {
    _.success(designDocId, 'design doc updated')
  })
  .catch(err => {
    _.error(err.request, err.message)
  })
}

const emtpyDesignDoc = function (designDocName) {
  return {
    _id: `_design/${designDocName}`,
    language: 'javascript'
  }
}

const removeSpaces = string => string.replace(/\s/g, '')
