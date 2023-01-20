const { statSync, createReadStream, writeFileSync, copyFileSync } = require('fs')
const { platform } = require('os')
const { exit } = require('process')
const { createHash } = require('crypto')
const path = require('path')

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
checkFile(mkcertPath, mkcertPath + '文件不存在')

const localServerPath = path.join(fileDir, 'teamClientServer' + fileSuffix)
checkFile(localServerPath, localServerPath + '文件不存在')

const hashToFilePath = path.join('src', 'main', 'consts', 'hash.ts')

;(async () => {
  try {
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
