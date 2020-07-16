require('should')
const couchInit = require('../index')

describe('unit', () => {
  it('should be a function', done => {
    couchInit.should.be.a.Function()
    done()
  })
})
