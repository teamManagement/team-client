import { UserInfo } from '@byzk/teamwork-sdk'
import { IpcMainEvent } from 'electron'
import { SdkHandlerParam } from '../..'
import { WsHandler } from '../../../socket'
import { sendHttpRequestToLocalServer } from '../../../tools'
import { AppInfo } from '../../insideSdk/applications'
import { registerWsNotification, unRegisterNotification } from '../../../socket/notices'

const currentSyncHandler = {
  appInfo(event: IpcMainEvent): AppInfo | undefined {
    return { ...((event.sender as any)._appInfo || {}), db: undefined }
  },
  userInfo(): Promise<UserInfo | undefined> {
    return sendHttpRequestToLocalServer('/user/now')
  },
  /**
   * 获取用户在线列表
   * @returns 在线用户Id列表
   */
  onlineUserIdList(): string[] {
    return WsHandler.onlineUserIdList
  },
  registerOnlineUserChange(event: IpcMainEvent, id: string): void {
    registerWsNotification('userOnlineStatus', {
      id,
      handler(...data: any) {
        event.sender.send(id, ...data)
      },
      sender: event.sender
    })
  },
  unRegisterOnlineUserChange(_event: IpcMainEvent, id: string): void {
    unRegisterNotification('userOnlineStatus', id)
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
