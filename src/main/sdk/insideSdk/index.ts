import { IpcMainInvokeEvent } from 'electron'
import { RegisterFn, SdkHandlerParam, SdkRegistryInfo } from '..'
import { _apiHandler } from './api'
import { _applicationsHandler, _applicationsSyncHandler } from './applications'
import { _remoteCacheHandler } from './cache'
import { _currentWindowHandler } from './currentWindow'
import { _electronSyncHandler } from './electron'
import { _modalWindowHandler } from './modalWindow'

const insideSdkIpcEventName = 'ipc-inside-sdk-with-promise'
const insideSdkSyncEventName = 'ipc-inside-sdk-with-sync'

function _childEventHandlerWrapper(
  childHandler: (eventName: any, ...data: any) => Promise<any> | any
): (param: SdkHandlerParam<IpcMainInvokeEvent, void>) => any {
  return (param) => {
    return childHandler(param.event, param.eventName, ...param.otherData)
  }
}

/**
 * 异步事件处理信息
 */
const promiseEventHandlerInfo: SdkRegistryInfo<void> = {
  name: insideSdkIpcEventName,
  prevHandle(param) {
    if (!param.otherData || param.otherData.length <= 0) {
      throw new Error('未知的操作指令')
    }
    param.eventName = param.otherData.splice(0, 1)[0]
  },
  eventPromiseHandleMap: {
    /**
     * api相关
     */
    api: _childEventHandlerWrapper(_apiHandler),
    /**
     * 当前窗体相关
     */
    currentWindow: _childEventHandlerWrapper(_currentWindowHandler),
    /**
     * 应用相关
     */
    applications: _childEventHandlerWrapper(_applicationsHandler),
    /**
     * 远程服务缓存
     */
    remoteCache: _childEventHandlerWrapper(_remoteCacheHandler)
  }
}

/**
 * 同步事件处理
 */
const syncEventHandlerInfo: SdkRegistryInfo<void> = {
  name: insideSdkSyncEventName,
  prevHandle(param) {
    if (!param.otherData || param.otherData.length <= 0) {
      throw new Error('未知的操作指令')
    }
    param.eventName = param.otherData.splice(0, 1)[0]
  },
  eventSyncHandleMap: {
    applications: _applicationsSyncHandler,
    modalWindow: _modalWindowHandler,
    electron: _electronSyncHandler
  }
}

/**
 * 初始化内部使用的sdk
 * @param registryFn sdk注册方法
 */
export function _initInsideSdk(registryFn: RegisterFn): void {
  registryFn(promiseEventHandlerInfo)
  registryFn(syncEventHandlerInfo)
}
