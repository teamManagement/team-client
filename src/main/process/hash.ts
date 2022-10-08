import process from 'process'
import fs from 'fs'
import { createHash } from 'crypto'
import logs from 'electron-log'
import { mkcertFilePath, packageInfo } from './vars'

function fileToSha512(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const h = createHash('sha512')
    let ok = false
    const fileReader = fs.createReadStream(filePath)
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

export async function verifyExternalProgramHash(): Promise<boolean> {
  try {
    if ((await fileToSha512(mkcertFilePath)) !== packageInfo.signature.mkcert[process.platform]) {
      logs.error('mkcert程序Hash验证失败')
      return false
    }

    logs.debug('mkcert程序Hash验证成功')

    return true
  } catch (e) {
    logs.error('外部程序文件Hash验证失败, 错误信息: ', JSON.stringify(e))
    return false
  }
}
