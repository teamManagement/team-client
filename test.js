const PouchDB = require('pouchdb')
const db = new PouchDB('/home/slx/works/06-teamManagement/team-client/db', {
  auth: { username: '', password: '' }
})
;(async () => {
  const sync = db.sync('http://127.0.0.1:5984/u12345678901234567890_remote_database', {
    live: true,
    retry: true,
    auth: {
      username: '12345678901234567890',
      password: '123456789'
    }
    // push: {
    //   auth: {
    // username: 'admin',
    // password: '123456789'
    //   }
    // },
    // pull: {
    //   auth: {
    //     username: 'admin',
    //     password: '123456789'
    //   }
    // }
  })
  //   await db.put({
  //     _id: '2',
  //     title: '35456sdf'
  //   })

  const data = await db.get('3')
  console.log(data)
  await db.put({
    _id: '3',
    title: 'sfgdf56765',
    _rev: data._rev
  })

  //   sync.cancel()
  //   await db.replicate.from('http://127.0.0.1:5984/remote_database', {
  //     auth: { username: 'admin', password: '123456789' }
  //   })
  //   const data = await db.get('1')
  //   console.log(data)
  //   db.replicate.to('http://127.0.0.1:5984/remote_database', {
  //     auth: { username: 'admin', password: '123456789' }
  //   })
})()
