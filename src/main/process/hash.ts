import process from 'process'
import logs from 'electron-log'
import { mkcertFilePath, packageLocalServerFilePath } from './vars'
import { is } from '@electron-toolkit/utils'
import { fileToSha512 } from '../tools'
import { packageInfo } from '../consts/packageInfo'

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
