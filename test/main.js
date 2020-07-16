const CONFIG = require('config')
const couchInit = require('../index')
require('should')

const dbBaseUrl = `http://${CONFIG.user}:${CONFIG.pass}@${CONFIG.host}`

const nano = require('nano-blue2')(dbBaseUrl)
const dbName = 'couch-init2-tests'
const db = nano.use(dbName)

const dbsList = [
 {
   name: dbName,
   designDocs: [ 'designdoc1', 'designdoc2' ]
 }
]

const designDocFolder = __dirname + '/fixtures'

describe('couch-init2', () => {
  it('should be a function', done => {
    couchInit.should.be.a.Function()
    done()
  })

  it('should create a missing database', done => {
    nano.db.destroy(dbName)
    .catch(err => {
      if (err.statusCode !== 404) throw err
    })
    .then(() => {
      couchInit(dbBaseUrl, dbsList, designDocFolder)
      .then(res => {
        res.ok.should.be.true()
        db.info()
        .then(res2 => {
          // Check that we have our 2 design docs
          res2[0].doc_count.should.equal(2)
          done()
        })
      })
    })
    .catch(done)
  })
})
