# couch-init2

[![npm package](http://img.shields.io/npm/v/couch-init2.svg?style=flat-square)](https://www.npmjs.com/package/couch-init2)
[![node](https://img.shields.io/badge/node-v4.3.x-brightgreen.svg)](http://nodejs.org)

**An opiniated CouchDB databases initializer**

Takes a list of databases to initialise and their design docs, and make sure that everything is up and running and in sync.

### Installation

in a terminal, at the root of your project
```sh
# ESM
npm install couch-init2
# CommonJS
npm install couch-init2@5
```

### How To

```javascript
import couchInit from 'couch-init2'

const dbUrl = 'http://username:password@localhost:5984'
const dbsList = [
   {
     name: 'dbname1',
     designDocs: ['designdoc1']
   },
   {
     name: 'dbname2',
     designDocs: ['designdoc2', 'designdoc3']
   },
   {
     name: 'dbname3',
     designDocs: []
   }
 ]
// Path to the folder where design docs can be found on the model `${designDocName}.json`
// If a design doc file from the list is missing, it will be created with a basic design doc structure
// If a design doc file changed, the database design doc will be updated
const designDocFolder = '/path/to/your/design/docs/folder'

const { ok, operations } = await couchInit(dbUrl, dbsList, designDocFolder)
console.log('ok', res.ok)
console.log('operations', res.operations)
// dbs were successfully initialized!
// time to start your server or whatever crazy thing you're building :)
```

### Design docs formats
#### json
The JSON format is identical to the document in database, minus the `_rev` id.
```json
{
  "_id": "_design/example",
  "language": "javascript",
  "views": {
    "byFoo": {
      "map": "function (doc) {\n  if (doc.foo) emit(doc.foo, 1)\n}"
    }
  }
}
```

#### js
The JS format allows to use a JS module that exports just the `views` object, the `_id` being deduced from the filename (ex: if the file is named `foo.js`, the `_id` will be `_design/foo`)
```js
export default {
  byFoo: {
    map: function (doc) {
      if (doc.foo) emit(doc.foo, 1)
    },
    reduce: function(keys, values) {
      return values.reduce((a, b) => a + b, 0)
    },
  },
  byBar: {
    // The function stringification won't be able to detect variables in scope.
    // In this case, you have to pass the function and its dependencies as a string.
    map: `
      const double = num => num * 2

      function (doc) {
        if (doc.foo) emit(doc.foo, double(1))
      }`,
  },
  byBuzz: {
    // Alternatively, an array of functions can be passed to preserve text editor
    // features such as syntax highlighting or linting
    map: [
      function double (num) { num * 2 },
      function (doc) {
        if (doc.example) emit(doc.example, double(1))
      }
    ]
  },
}
```

### What it does

* create databases if missing
* create or update design documents if not up-to-date
* create [security documents](http://docs.couchdb.org/en/1.6.1/api/database/security.html) if missing

## See also
* [couchdb-bootstrap](https://github.com/jo/couchdb-bootstrap): Bootstrap CouchDB projects: configure, setup security, deploy ddocs and create users.
