import { readFile } from 'node:fs/promises'
import fetch from 'node-fetch'
import { couchdbError } from './couchdb_error.js'
import { objectPromise } from './promise_props.js'

// This verifies that the database design documents are up-to-date
// with the design docs files
export async function syncDesignDocs (dbUrl, designDocsNames, designDocFolder) {
  const ops = {}
  designDocsNames.forEach(designDocName => {
    ops[designDocName] = syncDesignDoc(designDocFolder, dbUrl, designDocName)
  })
  return objectPromise(ops)
}

const syncDesignDoc = async (designDocFolder, dbUrl, designDocName) => {
  const jsDesignDoc = designDocName.endsWith('.js')
  if (jsDesignDoc) designDocName = designDocName.replace(/\.js$/, '')
  const designDocId = `_design/${designDocName}`
  const designDocUrl = `${dbUrl}/${designDocId}`
  let designDocFile
  if (jsDesignDoc) {
    designDocFile = await getJsDesignDoc(designDocFolder, designDocName)
  } else {
    designDocFile = await getJsonDesignDoc(designDocFolder, designDocName)
  }
  let currentDesignDoc, created
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
  const op = await updateDesignDoc(designDocFile, currentDesignDoc, designDocUrl)
  if (created) return { created }
  else return op
}

const getJsDesignDoc = async (designDocFolder, designDocName) => {
  const designDocPath = `${designDocFolder}/${designDocName}.js`
  let { default: jsDesignDoc } = await import(designDocPath)
  // Allow to pass just the view object
  if (!jsDesignDoc._id) {
    jsDesignDoc = {
      _id: `_design/${designDocName}`,
      language: 'javascript',
      views: jsDesignDoc,
    }
  }
  stringifyJsDesignDoc(jsDesignDoc.views)
  return JSON.stringify(jsDesignDoc)
}

const stringifyJsDesignDoc = views => {
  for (const view of Object.values(views)) {
    stringifyViewFunction(view, 'map')
    stringifyViewFunction(view, 'reduce')
  }
}

const stringifyViewFunction = (view, fnName) => {
  if (view[fnName] == null) return
  if (view[fnName] instanceof Array) {
    view[fnName] = view[fnName].map(stringifyFunction).join('\n')
  } else {
    view[fnName] = stringifyFunction(view[fnName])
  }
}

const stringifyFunction = fn => fn.toString().trim()

const getJsonDesignDoc = async (designDocFolder, designDocName) => {
  const designDocPath = `${designDocFolder}/${designDocName}.json`
  return readFile(designDocPath, { encoding: 'utf-8' })
}

const updateDesignDoc = async (designDocFile, currentDesignDoc, designDocUrl) => {
  const rev = currentDesignDoc && currentDesignDoc._rev

  // Delete the rev to be able to compare object
  delete currentDesignDoc._rev

  // designDocFile should be a stringified object
  const currentDesignDocStr = JSON.stringify(currentDesignDoc)
  if (typeof designDocFile !== 'string') designDocFile = JSON.stringify(designDocFile)

  // Comparison is made without spaces to avoid false negative
  if (removeSpaces(designDocFile) === removeSpaces(currentDesignDocStr)) return { updated: false }

  const update = JSON.parse(designDocFile)
  update._rev = rev

  const res = await fetch(designDocUrl, {
    method: 'PUT',
    body: JSON.stringify(update),
  })

  if (res.status !== 201) {
    throw (await couchdbError(res, { designDocFile, currentDesignDoc, designDocUrl }))
  }

  return { updated: true }
}

const removeSpaces = string => string.replace(/\s/g, '')
