import { ipcRenderer } from 'electron'
import { tryJsonParseDataHandler } from '../../_commons/tools'
import {
  sendInvokeIpcEventWrapperEventNameAndDataCallBack,
  sendSyncIpcEventWrapperEventNameAndDataCallBack
} from '../tools'

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
//#endregion

const sendInvokeIpcEvent = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'applications',
  tryJsonParseDataHandler
)

const sendSyncIpcEvent = sendSyncIpcEventWrapperEventNameAndDataCallBack('applications', undefined)

const _appOpenStatusNoticeFn: {
  [key: string]: (appInfo: AppInfo, status: 'open' | 'close') => void
} = {}

ipcRenderer.addListener(
  'ipc-app-open-status-notice',
  (_event, appInfo: AppInfo, status: 'open' | 'close') => {
    for (const key in _appOpenStatusNoticeFn) {
      _appOpenStatusNoticeFn[key](appInfo, status)
    }
  }
)

function listenStatusNotice(
  id: string,
  fn: (appInfo: AppInfo, status: 'open' | 'close') => void
): void {
  _appOpenStatusNoticeFn[id] = fn
}

function removeStatusNotice(id: string): void {
  delete _appOpenStatusNoticeFn[id]
}

export const applications = {
  /**
   * 监听应用状态变更通知
   */
  listenStatusNotice,
  /**
   * 移除应用状态变更通知
   */
  removeStatusNotice,
  /**
   * 打开一个应用
   * @param appInfo 应用信息
   */
  openApp(appInfo: AppInfo): Promise<void> {
    return sendInvokeIpcEvent('openApp', appInfo)
  },
  /**
   * 根据应用Id显示应用视图
   * @param id 应用ID
   */
  showById(id: string): Promise<void> {
    return sendInvokeIpcEvent('showById', id)
  },
  /**
   * 根据应用id弹出应用视图
   * @param id 应用ID
   */
  showInAlertById(id: string): Promise<void> {
    return sendInvokeIpcEvent('showInAlertById', id)
  },
  /**
   * 当前应用信息弹出显示
   */
  currentShowInAlert(): Promise<void> {
    return sendInvokeIpcEvent('currentShowInAlert')
  },
  /**
   * 根据应用id隐藏应用视图
   * @param id 应用ID
   */
  hideById(id: string): Promise<void> {
    return sendInvokeIpcEvent('hideById', id)
  },
  /**
   * 挂起当前应用视图
   */
  hangUp(): Promise<void> {
    return sendInvokeIpcEvent('hangUp')
  },
  /**
   * 恢复当前挂起应用
   */
  restore(): Promise<AppInfo | undefined> {
    return sendInvokeIpcEvent('restore')
  },
  /**
   * 隐藏最后打开的应用信息
   */
  hideEndOpenedApp(): Promise<void> {
    return sendInvokeIpcEvent('hideEndOpenedApp')
  },
  /**
   * 根据应用ID销毁应用视图
   * @param id 应用ID
   */
  destroyById(id: string): Promise<void> {
    return sendInvokeIpcEvent('destroyById', id)
  },
  /**
   * 销毁弹出的应用视图根据应用ID
   * @param id 应用ID
   */
  destroyAlertById(id: string): Promise<void> {
    return sendInvokeIpcEvent('destroyAlertById', id)
  },
  /**
   * 获取已经打开的应用列表
   * @returns 打开的应用列表
   */
  getOpenedIdList(): string[] {
    return sendSyncIpcEvent('getOpenedIdList')
  },
  /**
   * 获取当前的应用信息
   */
  getCurrentAppInfo(): AppInfo | undefined {
    return sendSyncIpcEvent('getCurrentAppInfo')
  }
}
