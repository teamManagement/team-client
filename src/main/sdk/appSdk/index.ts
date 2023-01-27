import { IpcMainInvokeEvent } from 'electron'
import { RegisterFn, SdkHandlerParam, SdkRegistryInfo } from '..'
import { AppInfo } from '../insideSdk/applications'
import { _cacheHandler } from './cache'
import { _channelHandler } from './channel'
import { _currentSyncHandler } from './current'
import { _dbHandler, _dbSyncHandler } from './db'
import { _dialogSyncHandler } from './dialog'
import { _downloadHandler } from './download'
import { _encodingHandler, _encodingSyncHandler } from './encoding'
import { _execHandler } from './exec'
import { _hostsHandler } from './hosts'
import { _notificationHandler } from './notification'
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

const noCheckAppInfoMethodName = [
  'httpFile',
  'showWithTemplate',
  'base64',
  'base64Decode',
  'base64DecodeToBuffer',
  'hex',
  'hexDecode',
  'hexDecodeToBuffer'
]

const promiseEventHandlerInfo: SdkRegistryInfo<AppInfo> = {
  name: applicationPreloadIpcEventName,
  prevHandle(param) {
    if (!param.otherData || param.otherData.length <= 0) {
      throw new Error('未知的操作指令')
    }
    param.eventName = param.otherData.splice(0, 1)[0]

    const appInfo = (param.event.sender as any)._appInfo as AppInfo
    if (!appInfo && !noCheckAppInfoMethodName.includes(param.eventName)) {
      throw new Error('未知的应用信息')
    }

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
    hosts: _childEventHandlerWrapper(_hostsHandler),
    /**
     * db相关
     */
    db: _childEventHandlerWrapper(_dbHandler),
    /**
     *
     */
    channel: _childEventHandlerWrapper(_channelHandler),
    /**
     * download相关api
     */
    download: _downloadHandler,
    /**
     * 消息通知
     */
    notification: _notificationHandler,
    /**
     * 编解码工具
     */
    encoding: _encodingHandler
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
    current: _currentSyncHandler,
    db: {
      sync: _dbSyncHandler
    },
    dialog: _dialogSyncHandler,
    encoding: {
      sync: _encodingSyncHandler
    }
  }
}

export function _initAppSdk(registryFn: RegisterFn): void {
  registryFn(promiseEventHandlerInfo)
  registryFn(syncEventHandlerInfo)
}
