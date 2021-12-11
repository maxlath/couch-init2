const CONFIG = require('config')
const couchInit = require('../index')
require('should')

const authHost = `http://${CONFIG.user}:${CONFIG.pass}@${CONFIG.host}`
const nonAuthHost = `http://${CONFIG.host}`
const dbName = 'couch-init2-tests'
const dbUrlWithAuth = `${authHost}/${dbName}`
const dbUrlWithoutAuth = `${nonAuthHost}/${dbName}`

const fetch = require('node-fetch')

const dbsList = [
  {
    name: dbName,
    designDocs: [ 'designdoc1', 'designdoc2' ]
  }
]

const jsDesignDocsDbsList = [
  {
    name: `${dbName}-bis`,
    designDocs: [ 'designdoc3.js' ]
  }
]

const designDocFolder = __dirname + '/fixtures'

const db = {
  info: async () => await fetch(dbUrlWithAuth).then(res => res.json()),
  get: async id => await fetch(`${dbUrlWithAuth}/${id}`).then(res => res.json()),
  put: async (id, body) => {
    return fetch(`${dbUrlWithAuth}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    })
  },
  delete: async () => {
    const res = await fetch(dbUrlWithAuth, { method: 'DELETE' })

    if (res.status >= 400 && res.status !== 404) {
      throw new Error(`${res.status}: ${res.statusText}`)
    }
  }
}

describe('integration', () => {
  beforeEach(async () => {
    await db.delete()
  })

  it('should create a missing database', async () => {
    const { ok } = await couchInit(authHost, dbsList, designDocFolder)
    ok.should.be.true()
    const info = await db.info(dbUrlWithAuth)
    // Check that we have our 2 design docs
    info.doc_count.should.equal(2)
  })

  it('should return operations summary', async () => {
    const { operations } = await couchInit(authHost, dbsList, designDocFolder)
    operations.should.be.an.Object()
    const dbOps = operations[dbName]
    dbOps.should.deepEqual({
      created: true,
      designDocs: { designdoc1: { created: true }, designdoc2: { created: true } },
    })
  })

  it('should create security documents (if not already set)', async () => {
    await couchInit(authHost, dbsList, designDocFolder)
    const securityDoc = await fetch(`${dbUrlWithAuth}/_security`).then(res => res.json())
    securityDoc.should.deepEqual({
      admins: { roles: [ '_admin' ] },
      members: { roles: [ '_admin' ] }
    })
  })

  it('should create a secured database', async () => {
    await couchInit(authHost, dbsList, designDocFolder)
    const res = await fetch(dbUrlWithoutAuth)
    res.status.should.equal(401)
  })

  it('should create missing design docs', async () => {
    await couchInit(authHost, dbsList, designDocFolder)
    const designDoc = await fetch(`${dbUrlWithAuth}/_design/designdoc2`).then(res => res.json())
    designDoc._rev.split('-')[0].should.equal('1')
    delete designDoc._rev
    const designDoc2File = require('./fixtures/designdoc2.json')
    designDoc.should.deepEqual(designDoc2File)
  })

  it('should update an existing design docs', async () => {
    await couchInit(authHost, dbsList, designDocFolder)
    const designDoc = await fetch(`${dbUrlWithAuth}/_design/designdoc2`).then(res => res.json())
    delete designDoc.views.byTimestamp
    await db.put('_design/designdoc2', designDoc)
    const updatedDesignDoc = await db.get('_design/designdoc2')
    updatedDesignDoc._rev.split('-')[0].should.equal('2')
    should(updatedDesignDoc.views.byTimestamp).not.be.ok()
    const { operations } = await couchInit(authHost, dbsList, designDocFolder)
    const dbOps = operations[dbName]
    dbOps.should.deepEqual({
      created: false,
      designDocs: { designdoc2: { updated: true } }
    })
    const reupdatedDesignDoc = await db.get('_design/designdoc2')
    reupdatedDesignDoc._rev.split('-')[0].should.equal('3')
    reupdatedDesignDoc.views.byTimestamp.map.should.be.a.String()
  })

  it('should accept design docs as js modules', async () => {
    const res = await couchInit(authHost, jsDesignDocsDbsList, designDocFolder)
    res.ok.should.be.true()
  })
})
