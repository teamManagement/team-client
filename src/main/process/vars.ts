import path from 'path'
import { is } from '@electron-toolkit/utils'
import logs from 'electron-log'

const sysName = process.platform === 'win32' ? 'windows' : 'linux'
const programSuffix = process.platform === 'win32' ? '.exe' : ''

let programDirPath = path.join('..', '..', '..')
if (is.dev) {
  programDirPath = path.join('..', '..', 'process', sysName)
}
programDirPath = path.join(__dirname, programDirPath)

logs.debug('外部程序文件存储目录: ', programDirPath)

export const mkcertFilePath = path.join(programDirPath, 'mkcert' + programSuffix)

logs.debug('mkcert可执行文件存储目录: ', mkcertFilePath)

export const packageInfo = require('../../package.json')
