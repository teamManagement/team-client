import { UserInfo } from '@byzk/teamwork-sdk'
import { IpcMainEvent } from 'electron'
import { SdkHandlerParam } from '../..'
import { sendHttpRequestToLocalServer } from '../../../tools'
import { AppInfo } from '../../insideSdk/applications'

const currentSyncHandler = {
  appInfo(event: IpcMainEvent): AppInfo | undefined {
    return { ...((event.sender as any)._appInfo || {}), db: undefined }
  },
  userInfo(): Promise<UserInfo | undefined> {
    return sendHttpRequestToLocalServer('/user/now')
  }
}

/**
 * current同步事件处理
 * @param eventName 事件名称
 * @param data 数据
 * @returns 响应数据
 */
export function _currentSyncHandler(param: SdkHandlerParam<IpcMainEvent, void>): any {
  const handler = currentSyncHandler[param.eventName]
  if (!handler) {
    return Promise.reject('未知的异常current指令')
  }

  return handler(param.event, ...param.otherData)
}
