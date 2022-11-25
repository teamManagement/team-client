import process from 'process'
import fs from 'fs'
import logs from 'electron-log'
import { mkcertFilePath, packageLocalServerFilePath, updaterLocalServerFilePath } from './vars'
import { is } from '@electron-toolkit/utils'
import { fileToSha512 } from '../tools'
import { packageInfo } from '../consts/packageInfo'

export async function verifyExternalProgramHash(): Promise<boolean> {
  try {
    if (is.dev) {
      logs.debug('当前环境为开发环境, 跳过本地服务文件的HASH验证')
      return true
    }

    if ((await fileToSha512(mkcertFilePath)) !== packageInfo.signature.mkcert[process.platform]) {
      logs.error('mkcert程序HASH验证失败')
      return false
    }

    logs.debug('mkcert程序HASH验证成功!')

    try {
      const stat = fs.statSync(updaterLocalServerFilePath)
      if (stat.isFile()) {
        if (
          (await fileToSha512(updaterLocalServerFilePath)) ===
          packageInfo.signature.localServer[process.platform]
        ) {
          try {
            fs.copyFileSync(updaterLocalServerFilePath, packageLocalServerFilePath)
          } catch (e) {
            logs.error(
              '发现有客户端服务更新程序, 但执行替换发生错误, 错误信息: ',
              JSON.stringify(e)
            )
            return false
          }
        }
        fs.unlinkSync(updaterLocalServerFilePath)
      }
    } catch (e) {
      //nothing
    }

    if (
      (await fileToSha512(packageLocalServerFilePath)) !==
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
