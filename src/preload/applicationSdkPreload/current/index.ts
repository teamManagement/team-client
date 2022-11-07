import { sendSyncIpcEventWrapperEventNameAndDataCallBack } from '../tools'

//#region APP相关接口
enum AppType {
  REMOTE_WEB,
  LOCAL_WEB
}

enum IconType {
  URL,
  ICON_FONT
}

interface AppInfo {
  id: string
  name: string
  inside: boolean
  type: AppType
  remoteSiteUrl: string
  url: string
  icon: string
  iconType: IconType
  desc: string
  shortDesc: string
  version: string
}

// const sendSyncIpcEvent = sendSyncIpcEventWrapperEventNameAndDataCallBack('current', undefined)

/**
 * 当前应用信息
 */
// const appInfo: AppInfo = sendSyncIpcEvent('appInfo')

export const current = {
  appInfo: {}
}
