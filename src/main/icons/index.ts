import * as path from 'path'
import { is, platform } from '@electron-toolkit/utils'

let iconDirPath = 'icons'
if (is.dev) {
  iconDirPath = 'build'
}

let iconFileName = 'icon.png'
if (platform.isMacOS) {
  iconFileName = 'icon.icns'
} else if (platform.isWindows) {
  iconFileName = 'icon.ico'
}

export const AppIcon = path.join(__dirname, '..', '..', iconDirPath, iconFileName)
console.log(AppIcon)

export * from './logo'
