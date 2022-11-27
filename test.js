const PouchDB = require('pouchdb')
const fs = require('fs')

const db = new PouchDB('/home/slx/works/06-teamManagement/team-client/db', {
  auto_compaction: true
  // auth: { username: '', password: '' }
})
;(async () => {
  // const sync = db.sync('http://127.0.0.1:5984/u12345678901234567890_remote_database', {
  //   live: true,
  //   retry: true,
  //   auth: {
  //     username: '12345678901234567890',
  //     password: '123456789'
  //   }
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
  // })
  //   await db.put({
  //     _id: '2',
  //     title: '35456sdf'
  //   })

  let srcData = await db.get('123')
  console.log(srcData)

  // await db.removeAttachment('123', 'head.png', '10-9bcdc8d8ee2290d57acbc4b22bfc7572')

  // const fileContent = fs.readFileSync('/home/slx/Pictures/壁纸/1.png')
  const fileContent = fs.readFileSync(
    '/home/slx/Pictures/头像/v2-7296bcc754c263b3a797ac7b20f5b163_r.jpg'
  )
  await db.putAttachment(
    '123',
    'head.png',
    '13-24739577a60c6623f91c736b71e12b9b',
    fileContent,
    'image/jpg'
  )

  srcData = await db.get('123')
  console.log(srcData)

  // const data = await db.get('')
  // console.log(data)
  // await db.put({
  // _id: '3',
  // title: 'sfgdf56765',
  // _rev: data._rev
  // })

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
