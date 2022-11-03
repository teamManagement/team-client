import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { userInfo } from 'os'

// 用户家目录
export const USER_HOME = app.getPath('home')

const userLocalConfigDir = path.join(USER_HOME, '.teamwork')
try {
  fs.mkdirSync(path.join(USER_HOME, '.teamwork'), { recursive: true })
} catch (e) {
  //nothing
}

// 用户配置目录
export const USER_LOCAL_CONFIG_DIR = userLocalConfigDir

export const SYS_USERINFO = userInfo()
