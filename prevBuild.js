const {
  statSync,
  createReadStream,
  writeFileSync,
  copyFileSync,
  mkdirSync,
  createWriteStream
} = require('fs')
const { platform, arch } = require('os')
const { exit } = require('process')
const { createHash } = require('crypto')
const path = require('path')
const http = require('https')

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

function getMkcertDownloadUrl() {
  let downloadPlatform = ''
  switch (currentPlatform) {
    case 'win32':
      downloadPlatform = 'windows'
      break
    case 'linux':
    case 'darwin':
      downloadPlatform = currentPlatform
      break
    default:
      console.error('不支持的平台: ', currentPlatform)
      exit(3)
      return
  }

  let downloadArch = ''
  switch (arch()) {
    case 'x64':
      downloadArch = 'amd64'
      break
    case 'arm':
    case 'arm64':
      downloadArch = arch()
      break
    default:
      console.error('不支持的架构: ', arch())
      exit(4)
      return
  }

  return `https://dl.filippo.io/mkcert/latest?for=${downloadPlatform}/${downloadArch}`
}

function downloadHttpFile(url, localPath) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        try {
          mkdirSync(path.dirname(localPath), { recursive: true })
        } catch (e) {
          //nothing
        }

        try {
          const writer = createWriteStream(localPath)
          res.pipe(writer)
          writer.on('finish', () => {
            writer.close()
            resolve()
          })
        } catch (e) {
          reject(e)
        }
      })
      .on('error', (e) => {
        reject(e)
      })
  })
}

;(async () => {
  try {
    console.log('下载mkcert...')
    // await download(downloadUrl, './', { filename: 'mkcert' })
    await downloadHttpFile(getMkcertDownloadUrl(), mkcertPath)
    // await download(downloadUrl, fileDir, { filename: 'mkcert' })
    console.log('下载mkcert成功!!!')
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
  } catch (e) {
    console.error('写出hash到文件失败')
    console.error(e)
    exit(2)
  }
  copyFileSync('antd.css', path.join('node_modules', 'antd', 'dist', 'antd.css'))
})()

// 'arm'`, `'arm64'`, `'ia32'`, `'mips'`,`'mipsel'`, `'ppc'`, `'ppc64'`, `'s390'`, `'s390x'`, `'x32'`, and `'x64'`.
