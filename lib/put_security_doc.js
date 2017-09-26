const _ = require('inv-loggers')
const breq = require('bluereq')

module.exports = function (db, dbBaseUrl, dbName) {
  const username = parseUsername(dbBaseUrl)
  return db.get('_security')
  .spread(function (body, headers) {
    if (body.admins == null) {
      const url = `${dbBaseUrl}/${dbName}/_security`
      _.info(dbName, 'adding security doc')

      // nano can't insert a document starting with an underscore
      // thus the need to put the document directly
      return breq.put(url, securityDoc(username))
      .catch(_.ErrorRethrow('put security doc'))
    }
  })
}

// from 'http://username:password@localhost:5984'
// to 'username'
const parseUsername = dbBaseUrl => dbBaseUrl.split('://')[1].split(':')[0]

const securityDoc = function (username) {
  if (!username || username.length === 0) {
    throw new Error('could not find username from db url')
  }
  return {
    // Database admins can update design documents
    // and edit the admin and member lists.
    admins: { names: [username] },
    // Database members can access the database.
    // If no members are defined, the database is public.
    // Thus we just copy the admin there too to limit database access
    members: { names: [username] }
  }
}
