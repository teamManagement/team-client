import process from 'process'
import fs from 'fs'
import { createHash } from 'crypto'
import logs from 'electron-log'
import { localServerFilePath, mkcertFilePath, packageInfo } from './vars'
import { is } from '@electron-toolkit/utils'

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
      logs.error('mkcert程序HASH验证失败')
      return false
    }

    logs.debug('mkcert程序HASH验证成功!')

    if (is.dev) {
      logs.debug('当前环境为开发环境, 跳过本地服务文件的HASH验证')
      return true
    }

    if (
      (await fileToSha512(localServerFilePath)) !==
      packageInfo.signature.localServer[process.platform]
    ) {
      logs.error('本地服务文件HASH验证失败')
      return false
    }

    logs.debug('本地服务文件HASH验证成功!')

    return true
  } catch (e) {
    logs.error('外部程序文件HASH验证失败, 错误信息: ', JSON.stringify(e))
    return false
  }
}
