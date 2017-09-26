const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))

module.exports = {
  readFile: path => fs.readFileAsync(path, { encoding: 'utf-8' }),
  writeFile: fs.writeFileAsync.bind(fs)
}
