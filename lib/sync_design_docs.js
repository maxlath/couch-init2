const { readFile, writeFile } = require('fs').promises
const fetch = require('node-fetch')
const promiseProps = require('./promise_props')
const couchdbError = require('./couchdb_error')

// This verifies that the database design documents are up-to-date
// with the design docs files
module.exports = async (dbUrl, designDocsNames, designDocFolder) => {
  const ops = {}
  designDocsNames.forEach(designDocName => {
    ops[designDocName] = syncDesignDoc(designDocFolder, dbUrl, designDocName)
  })
  return promiseProps(ops)
}

const syncDesignDoc = async (designDocFolder, dbUrl, designDocName) => {
  const designDocId = `_design/${designDocName}`
  const designDocUrl = `${dbUrl}/${designDocId}`
  const designDocFile = await getDesignDocFile(designDocFolder, designDocName)
  let currentDesignDoc
  let created
  const res = await fetch(designDocUrl)
  if (res.status === 200) {
    currentDesignDoc = await res.json()
  } else if (res.status === 404) {
    // pass an empty document to trigger a document update
    currentDesignDoc = {}
    created = true
  } else {
    throw new Error(`${res.status}: ${res.statusText}`)
  }
  const op = await updateDesignDoc(designDocId, designDocFile, currentDesignDoc, designDocUrl)
  if (created) return { created }
  else return op
}

const getDesignDocFile = async (designDocFolder, designDocName) => {
  const designDocPath = `${designDocFolder}/${designDocName}.json`
  try {
    return await readFile(designDocPath, { encoding: 'utf-8' })
  } catch (err) {
    if (err.code !== 'ENOENT') throw err

    // Initialize the design doc if none is found
    // Return a stringify version to keep consistency
    // with what would the normal readFile
    const initDoc = JSON.stringify(emtpyDesignDoc(designDocName), null, 4)

    // Initializing the missing design doc file
    await writeFile(designDocPath, initDoc)

    return initDoc
  }
}

const updateDesignDoc = async (designDocId, designDocFile, currentDesignDoc, designDocUrl) => {
  const rev = currentDesignDoc && currentDesignDoc._rev

  // Delete the rev to be able to compare object
  delete currentDesignDoc._rev

  // designDocFile should be a stringified object
  const currentDesignDocStr = JSON.stringify(currentDesignDoc)

  // Comparison is made without spaces to avoid false negative
  if (removeSpaces(designDocFile) === removeSpaces(currentDesignDocStr)) return { updated: false }

  const update = JSON.parse(designDocFile)
  update._rev = rev

  const res = await fetch(designDocUrl, {
    method: 'PUT',
    body: JSON.stringify(update)
  })

  if (res.status !== 201) {
    throw (await couchdbError(res))
  }

  return { updated: true }
}

const emtpyDesignDoc = designDocName => ({
  _id: `_design/${designDocName}`,
  language: 'javascript'
})

const removeSpaces = string => string.replace(/\s/g, '')
