# couch-init2

[![npm package](http://img.shields.io/npm/v/couch-init2.svg?style=flat-square)](https://www.npmjs.com/package/couch-init2)
[![node](https://img.shields.io/badge/node-v4.3.x-brightgreen.svg)](http://nodejs.org)

**An opiniated CouchDB databases initializer**

Takes a list of databases to initialise and their design docs, and make sure that everything is up and running and in sync.

### Installation

in a terminal, at the root of your project
```sh
npm install couch-init2 --save
```

### How To

```javascript
var dbUrl = 'http://username:password@localhost:5984'
var dbsList = [
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
var designDocFolder = '/path/to/your/design/docs/folder'

couchInit(dbUrl, dbsList, designDocFolder)
// returns a promise
.then(res => {
  console.log('ok', res.ok)
  console.log('operations', res.operations)
  // dbs were successfully initialized!
  // time to start your server or whatever crazy thing you're building :)
})
.catch(err => { // handle the error })
```

### What it does

* create databases if missing
* create or update design documents if not up-to-date
* create [security documents](http://docs.couchdb.org/en/1.6.1/api/database/security.html) if missing
