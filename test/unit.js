import 'should'
import couchInit from '../lib/main.js'

describe('unit', () => {
  it('should be a function', done => {
    couchInit.should.be.a.Function()
    done()
  })
})
