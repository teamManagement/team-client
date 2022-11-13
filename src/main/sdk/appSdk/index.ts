import { IpcMainInvokeEvent } from 'electron'
import { RegisterFn, SdkHandlerParam, SdkRegistryInfo } from '..'
import { AppInfo } from '../insideSdk/applications'
import { _cacheHandler } from './cache'
import { _currentSyncHandler } from './current'
import { _execHandler } from './exec'
import { _hostsHandler } from './hosts'
import { _proxyHandler } from './proxy'
import { _storeHandler } from './store'

const applicationPreloadIpcEventName = 'ipc-application-preload-with-promise'
const applicationPreloadIpcSyncEventName = 'ipc-application-preload-with-sync'

function _childEventHandlerWrapper(
  childHandler: (appInfo: AppInfo, eventName: any, ...data: any) => Promise<any> | any
): (param: SdkHandlerParam<IpcMainInvokeEvent, AppInfo>) => any {
  return (param) => {
    return childHandler(param.prevData, param.eventName, ...param.otherData)
  }
}

const promiseEventHandlerInfo: SdkRegistryInfo<AppInfo> = {
  name: applicationPreloadIpcEventName,
  prevHandle(param) {
    const appInfo = (param.event.sender as any)._appInfo as AppInfo
    if (!appInfo) {
      throw new Error('未知的应用信息')
    }

    if (!param.otherData || param.otherData.length <= 0) {
      throw new Error('未知的操作指令')
    }
    param.eventName = param.otherData.splice(0, 1)[0]

    return appInfo
  },
  eventPromiseHandleMap: {
    /**
     * 存储相关
     */
    store: _childEventHandlerWrapper(_storeHandler),
    /**
     * 命令执行相关
     */
    exec: _childEventHandlerWrapper(_execHandler),
    /**
     * 代理相关
     */
    proxy: _childEventHandlerWrapper(_proxyHandler),
    /**
     * 缓存相关
     */
    cache: _childEventHandlerWrapper(_cacheHandler),
    /**
     * hosts相关
     */
    hosts: _childEventHandlerWrapper(_hostsHandler)
  }
}

const syncEventHandlerInfo: SdkRegistryInfo<void> = {
  name: applicationPreloadIpcSyncEventName,
  prevHandle(param) {
    if (!param.otherData || param.otherData.length <= 0) {
      throw new Error('未知的操作指令')
    }
    param.eventName = param.otherData.splice(0, 1)[0]
  },
  eventSyncHandleMap: {
    current: _currentSyncHandler
  }
}

export function _initAppSdk(registryFn: RegisterFn): void {
  registryFn(promiseEventHandlerInfo)
  registryFn(syncEventHandlerInfo)
}