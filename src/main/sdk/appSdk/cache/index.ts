import { AppInfo } from '../../insideSdk/applications'
import { _fileCacheHandler } from './fileCache'
import { _strCacheHandler } from './strCache'

export function _cacheHandler(appInfo: AppInfo, eventName: string, ...data: any): Promise<any> {
  if (!eventName) {
    return Promise.reject(new Error('未知的缓存事件名称'))
  }

  const eventGroup = eventName.split('.')
  if (eventGroup.length !== 2) {
    return Promise.reject(new Error('未知的缓存指令'))
  }

  switch (eventGroup[0]) {
    case 'file':
      return _fileCacheHandler(appInfo, eventGroup[1] as any, ...data)
    case 'default':
      return _strCacheHandler(appInfo, eventGroup[1] as any, ...data)
    default:
      return Promise.reject(new Error('不支持的缓存指令'))
  }
}
