const { readFile, writeFile } = require('fs').promises
const { blue, green } = require('tiny-chalk')
const fetch = require('node-fetch')

// This verifies that the database design documents are up-to-date
// with the design docs files
module.exports = (dbUrl, dbName, designDocs, designDocFolder) => {
  return Promise.all(designDocs.map(syncDesignDoc(designDocFolder, dbUrl)))
}

const syncDesignDoc = (designDocFolder, dbUrl) => async designDocName => {
  const designDocId = `_design/${designDocName}`
  const designDocUrl = `${dbUrl}/${designDocId}`
  const designDocFile = await getDesignDocFile(designDocFolder, designDocName)
  const currentDesignDoc = await getCurrentDesignDoc(designDocUrl, designDocId)
  return updateDesignDoc(designDocId, designDocFile, currentDesignDoc, designDocUrl)
}

const getDesignDocFile = async (designDocFolder, designDocName) => {
  const designDocPath = `${designDocFolder}/${designDocName}.json`
  try {
    return await readFile(designDocPath, { encoding: 'utf-8' })
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(err, 'reloadDesignDoc readFile err')
      throw err
    }

    // Initialize the design doc if none is found
    // Return a stringify version to keep consistency
    // with what would the normal readFile
    const initDoc = JSON.stringify(emtpyDesignDoc(designDocName), null, 4)

    // Initializing the missing design doc file
    await writeFile(designDocPath, initDoc)
    console.log(blue(`design doc file created: ${designDocPath}`))

    return initDoc
  }
}

const getCurrentDesignDoc = async (designDocUrl, designDocId) => {
  try {
    return await fetch(designDocUrl).then(res => res.json())
  } catch (err) {
    if (err.statusCode !== 404) throw err
    console.log(blue(`${designDocId}: design doc not found: creating`))
    // pass an empty document to trigger a document update
    return {}
  }
}

const updateDesignDoc = async (designDocId, designDocFile, currentDesignDoc, designDocUrl) => {
  const rev = currentDesignDoc && currentDesignDoc._rev

  // Delete the rev to be able to compare object
  delete currentDesignDoc._rev

  // designDocFile should be a stringified object
  const currentDesignDocStr = JSON.stringify(currentDesignDoc)

  // Comparison is made without spaces to avoid false negative
  if (removeSpaces(designDocFile) === removeSpaces(currentDesignDocStr)) return

  console.log(blue('updating design doc'), designDocId)
  const update = JSON.parse(designDocFile)
  update._rev = rev

  const res = await fetch(designDocUrl, {
    method: 'PUT',
    body: JSON.stringify(update)
  })

  if (res.status !== 201) throw new Error(`${res.status}: ${res.statusText}`)

  console.log(green(`${designDocId}: design doc updated`))
}

const emtpyDesignDoc = function (designDocName) {
  return {
    _id: `_design/${designDocName}`,
    language: 'javascript'
  }
}

const removeSpaces = string => string.replace(/\s/g, '')
