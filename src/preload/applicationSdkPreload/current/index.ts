import { ipcRenderer } from 'electron'
import { UserInfo } from '@byzk/teamwork-sdk'
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

const sendSyncIpcEvent = sendSyncIpcEventWrapperEventNameAndDataCallBack('current', undefined)

/**
 * 当前应用信息
 */
const appInfo: AppInfo = sendSyncIpcEvent('appInfo')

let userInfo: UserInfo | undefined

try {
  userInfo = sendSyncIpcEvent('userInfo')
} catch (e) {
  userInfo = undefined
}

type OnlineUserChangeHandler = (
  status: 'online' | 'offline',
  userId: string,
  onlineUserIdList: string[]
) => void

const _onlineUserChangeHandlerId: string[] = []

export const current = {
  appInfo,
  userInfo,
  onlineUserIdList(): string[] {
    return sendSyncIpcEvent('onlineUserIdList')
  },
  registerOnlineUserChange(id: string, handler: OnlineUserChangeHandler): void {
    sendSyncIpcEvent('registerOnlineUserChange', id)
    if (_onlineUserChangeHandlerId.includes(id)) {
      ipcRenderer.removeAllListeners(id)
    }
    ipcRenderer.addListener(
      id,
      (_event: any, status: 'online' | 'offline', userId: string, onlineUserIdList: string[]) => {
        handler(status, userId, onlineUserIdList)
      }
    )
  },
  unRegisterOnlineUserChange(id: string): void {
    sendSyncIpcEvent('unRegisterOnlineUserChange', id)
    ipcRenderer.removeAllListeners(id)
    const index = _onlineUserChangeHandlerId.indexOf(id)
    if (index > -1) {
      _onlineUserChangeHandlerId.splice(index, 1)
    }
  }
}
