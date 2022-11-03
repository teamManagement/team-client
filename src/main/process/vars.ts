import path from 'path'
import { is } from '@electron-toolkit/utils'
import logs from 'electron-log'
import { USER_LOCAL_CONFIG_DIR } from '../consts'

const sysName = process.platform === 'win32' ? 'win' : 'linux'
const programSuffix = process.platform === 'win32' ? '.exe' : ''

let programDirPath = path.join('..', '..', '..')
if (is.dev) {
  programDirPath = path.join('..', '..', 'process', sysName)
}
programDirPath = path.join(__dirname, programDirPath)

logs.debug('外部程序文件存储目录: ', programDirPath)

export const mkcertFilePath = path.join(programDirPath, 'mkcert' + programSuffix)

export const updaterLocalServerFilePath = path.join(
  programDirPath,
  'teamClientServer-updater' + programSuffix
)

export const packageLocalServerFilePath = path.join(
  programDirPath,
  'teamClientServer' + programSuffix
)

export const localServerFilePath = path.join(
  USER_LOCAL_CONFIG_DIR,
  'teamworkClientServer' + programSuffix
)

logs.debug('mkcert可执行文件存储目录: ', mkcertFilePath)

export const asarAbsPath = path.join(programDirPath, 'app.asar')
