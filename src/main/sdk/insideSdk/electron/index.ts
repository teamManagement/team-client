import { IpcMainEvent } from 'electron'
import { is } from '@electron-toolkit/utils'
import { SdkHandlerParam } from '../..'

const electronSyncHandler = {
  isDev(): boolean {
    return is.dev
  }
}

/**
 * electron同步事件处理
 * @param eventName 事件名称
 * @param data 数据
 * @returns 响应数据
 */
export function _electronSyncHandler(param: SdkHandlerParam<IpcMainEvent, void>): any {
  const handler = electronSyncHandler[param.eventName]
  if (!handler) {
    return Promise.reject('未知的异常electron指令')
  }

  return handler(param.event, ...param.otherData)
}
