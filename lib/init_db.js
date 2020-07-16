const fetch = require('node-fetch')
const putSecurityDoc = require('./put_security_doc')
const syncDesignDocs = require('./sync_design_docs')
const { green } = require('tiny-chalk')

module.exports = (couchdbHost, designDocFolder) => async dbData => {
  const { name: dbName, designDocs } = dbData
  const dbUrl = `${couchdbHost}/${dbName}`
  await ensureDbExistance(dbUrl, dbName)

  return Promise.all([
    syncDesignDocs(dbUrl, dbName, designDocs, designDocFolder),
    putSecurityDoc(dbUrl, dbName)
  ])
}

const ensureDbExistance = async (dbUrl, dbName) => {
  const res = await fetch(dbUrl)
  if (res.status === 200) {
    console.log(green(`${dbName} database: exist`), res)
    return { created: false }
  } else if (res.status === 404) {
    await create(dbUrl, dbName)
    return { created: true }
  } else {
    throw new Error(`${res.status}: ${res.statusText}`)
  }
}

const create = async (dbUrl, dbName) => {
  const res = await fetch(dbUrl, { method: 'PUT' })
  if (res.status === 201) {
    console.log(green(`${dbName} database: created`))
  } else {
    throw new Error(`${res.status}: ${res.statusText}`)
  }
}
