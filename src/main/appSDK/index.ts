import { ipcMain, IpcMainEvent } from 'electron'
import { AppInfo } from '../applications/manager'
import { ipcEventPromiseWrapper } from '../tools/ipc'
import { _cacheHandler } from './cache'
import { _execHandler } from './exec'
import { _proxyHandler } from './proxy'
import { _storeHandler } from './store'

const applicationPreloadIpcEventName = 'ipc-application-preload-with-promise'
const applicationPreloadIpcSyncEventName = 'ipc-application-preload-with-sync'

type OperationName = 'store' | 'exec' | 'proxy' | 'cache'

export function _initApplicationPreload(): void {
  ipcMain.handle(
    applicationPreloadIpcEventName,
    ipcEventPromiseWrapper((event, operationName: OperationName, eventName: any, ...data: any) => {
      const appInfo = (event.sender as any)._appInfo as AppInfo
      if (!appInfo) {
        return Promise.reject(new Error('未知的应用信息'))
      }
      switch (operationName) {
        case 'store':
          return _storeHandler(appInfo, eventName, ...data)
        case 'exec':
          return _execHandler(appInfo, eventName, ...data)
        case 'proxy':
          return _proxyHandler(appInfo, eventName, ...data)
        case 'cache':
          return _cacheHandler(appInfo, eventName, ...data)
        default:
          return Promise.reject(new Error('未知的操作事件'))
      }
    })
  )
  ipcMain.addListener(
    applicationPreloadIpcSyncEventName,
    (event: IpcMainEvent, eventName: string) => {
      switch (eventName) {
        case 'currentInfo':
          event.returnValue = (event.sender as any)._appInfo
          break
        default:
          event.returnValue = undefined
          return
      }
    }
  )
}
