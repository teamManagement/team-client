const { statSync, createReadStream, writeFileSync, copyFileSync } = require('fs')
const { platform } = require('os')
const { exit } = require('process')
const { createHash } = require('crypto')
const path = require('path')

console.log('当前所在目录:', __dirname)

function fileToSha512(filePath) {
  return new Promise((resolve, reject) => {
    const h = createHash('sha512')
    let ok = false
    const fileReader = createReadStream(filePath)
    fileReader.addListener('error', (err) => {
      ok = true
      reject(err)
    })
    fileReader.addListener('data', (buf) => {
      h.update(buf)
    })
    fileReader.addListener('end', () => {
      if (ok) {
        return
      }
      resolve(h.digest('hex'))
    })
  })
}

function checkFile(filePath, errorMsg) {
  try {
    const stat = statSync(filePath)
    if (stat.isDirectory()) {
      throw new Error('文件错误')
    }
  } catch (e) {
    console.error(errorMsg)
    exit(1)
  }
}

const currentPlatform = platform()
let fileSuffix = ''
if (currentPlatform === 'win32') {
  fileSuffix = '.exe'
}

const fileDir = path.join('process', currentPlatform)
const mkcertPath = path.join(fileDir, 'mkcert' + fileSuffix)

const localServerPath = path.join(fileDir, 'teamClientServer' + fileSuffix)

const hashToFilePath = path.join('src', 'main', 'consts', 'hash.ts')

// function getMkcertDownloadUrl() {
//   let downloadPlatform = ''
//   switch (currentPlatform) {
//     case 'win32':
//       downloadPlatform = 'windows'
//       break
//     case 'linux':
//     case 'darwin':
//       downloadPlatform = currentPlatform
//       break
//     default:
//       console.error('不支持的平台: ', currentPlatform)
//       exit(3)
//       return
//   }

//   let downloadArch = ''
//   switch (arch()) {
//     case 'x64':
//       downloadArch = 'amd64'
//       break
//     case 'arm':
//     case 'arm64':
//       downloadArch = arch()
//       break
//     default:
//       console.error('不支持的架构: ', arch())
//       exit(4)
//       return
//   }

//   return `https://dl.filippo.io/mkcert/latest?for=${downloadPlatform}/${downloadArch}`
// }

// function downloadHttpFile(url, localPath) {
//   return new Promise((resolve, reject) => {
//     http
//       .get(url, async (res) => {
//         if (res.statusCode === 301) {
//           try {
//             let data = ''
//             res.on('data', (d) => (data += d.toString()))
//             res.on('end', async () => {
//               console.log('下载文件:', url, ' 发生301重定向, 内容: ', data)
//               const hrefIndexof = data.indexOf('href')
//               if (hrefIndexof === -1) {
//                 reject(new Error('解析301内容的href属性失败'))
//                 return
//               }

//               data = data.substring(hrefIndexof + 6)
//               const hrefEndIndexof = data.indexOf('"')
//               if (hrefEndIndexof === -1) {
//                 reject(new Error('解析301内容的href属性结束标识失败'))
//                 return
//               }

//               data = data.substring(0, hrefEndIndexof)
//               try {
//                 await downloadHttpFile(data, localPath)
//                 resolve()
//               } catch (e) {
//                 reject(e)
//               }
//             })
//           } catch (e) {
//             reject(e)
//           }
//           return
//         }

//         if (res.statusCode === 302) {
//           const location = res.headers.location
//           console.log('请求文件地址:', url, ', 发生302重定向, 目标地址:', location)
//           try {
//             await downloadHttpFile(location, localPath)
//             resolve()
//           } catch (e) {
//             reject(e)
//           }
//           return
//         }

//         try {
//           mkdirSync(path.dirname(localPath), { recursive: true })
//         } catch (e) {
//           //nothing
//         }

//         try {
//           const writer = createWriteStream(localPath)
//           res.pipe(writer)
//           writer.on('finish', () => {
//             console.log('文件写出完成到:', localPath, '成功')
//             writer.close()
//             resolve()
//           })
//         } catch (e) {
//           reject(e)
//         }
//       })
//       .on('error', (e) => {
//         reject(e)
//       })
//       .end()
//   })
// }

;(async () => {
  try {
    // console.log('下载mkcert...')
    // await download(downloadUrl, './', { filename: 'mkcert' })
    // await downloadHttpFile(getMkcertDownloadUrl(), mkcertPath)
    // await download(downloadUrl, fileDir, { filename: 'mkcert' })
    // console.log('下载mkcert成功!!!')
    checkFile(mkcertPath, mkcertPath + '文件不存在')
    checkFile(localServerPath, localServerPath + '文件不存在')

    const mkcertSha512 = await fileToSha512(mkcertPath)
    const localServerSha512 = await fileToSha512(localServerPath)
    const fileHash = `export const hashMkcert =
    '${mkcertSha512}'
  export const hashLocalServer =
    '${localServerSha512}'
  `

    writeFileSync(hashToFilePath, fileHash)
    console.log('预编译脚本执行完成!!')
    copyFileSync('antd.css', path.join('node_modules', 'antd', 'dist', 'antd.css'))
    console.log('替换antd.css文件成功')
    exit(0)
  } catch (e) {
    console.error('写出hash到文件失败')
    console.error(e)
    exit(2)
  }
})()
