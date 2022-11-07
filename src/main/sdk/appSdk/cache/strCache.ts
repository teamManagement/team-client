import { sendHttpRequestToLocalServer } from '../../../tools'
import { AppInfo } from '../../insideSdk/applications'

type EventName = 'store' | 'get' | 'delete' | 'clear' | 'has' | 'delay'

export function _strCacheHandler(
  appInfo: AppInfo,
  eventName: EventName,
  ...data: any
): Promise<any> {
  switch (eventName) {
    case 'store':
      return cacheStore(appInfo, data[0], data[1], data[2])
    case 'get':
      return cacheGet(appInfo, data[0])
    case 'delete':
      return cacheDelete(appInfo, data[0])
    case 'clear':
      return cacheClear(appInfo)
    case 'has':
      return cacheHas(appInfo, data[0])
    case 'delay':
      return cacheDelay(appInfo, data[0], data[1])
    default:
      return Promise.reject(new Error('不支持的缓存指令'))
  }
}

/**
 * 存储缓存
 * @param appInfo 应用信息
 * @param key 缓存key
 * @param value 缓存value
 * @param expire 有效期
 */
function cacheStore(appInfo: AppInfo, key: string, value: string, expire?: number): Promise<void> {
  if (typeof key !== 'string') {
    return Promise.reject(new Error('不支持的key类型'))
  }

  if (typeof value !== 'string') {
    return Promise.reject(new Error('不支持的Value类型'))
  }

  if (typeof expire === 'undefined') {
    expire = 0
  }

  if (typeof expire !== 'number') {
    return Promise.reject(new Error('非法的有效期'))
  }

  return sendHttpRequestToLocalServer(`/cache/str/set/${appInfo.id}`, {
    jsonData: {
      key,
      value,
      expire
    }
  })
}

/**
 * 缓存内容获取
 * @param appInfo 应用信息
 * @param key 缓存Key
 * @return 缓存值
 */
function cacheGet(appInfo: AppInfo, key: string): Promise<any> {
  if (typeof key !== 'string') {
    return Promise.reject('不支持的key类型')
  }

  return sendHttpRequestToLocalServer(`/cache/str/get/${appInfo.id}?k=${key}`)
}

/**
 * 缓存删除
 * @param appInfo 应用信息
 * @param key key名称
 */
function cacheDelete(appInfo: AppInfo, key: string): Promise<void> {
  if (typeof key !== 'string') {
    return Promise.reject('不支持的key类型')
  }
  return sendHttpRequestToLocalServer(`/cache/str/delete/${appInfo.id}?k=${key}`)
}

/**
 * 清空缓存
 * @param appInfo 应用信息
 */
function cacheClear(appInfo: AppInfo): Promise<void> {
  return sendHttpRequestToLocalServer(`/cache/str/clear/${appInfo.id}`)
}

/**
 * 是否拥有缓存
 * @param appInfo 应用信息
 * @param key key
 * @return 是/否
 */
function cacheHas(appInfo: AppInfo, key: string): Promise<boolean> {
  if (typeof key !== 'string') {
    return Promise.reject('不支持的key类型')
  }

  return sendHttpRequestToLocalServer(`/cache/str/has/${appInfo.id}?k=${key}`)
}

/**
 * 缓存
 * @param appInfo 应用信息
 * @param key key信息
 * @param expire 过期信息
 */
function cacheDelay(appInfo: AppInfo, key: string, expire?: number): Promise<boolean> {
  if (typeof key !== 'string') {
    return Promise.reject('不支持的key类型')
  }

  if (typeof expire === 'undefined') {
    expire = 0
  }

  if (typeof expire !== 'number') {
    return Promise.reject(new Error('非法的有效期'))
  }

  return sendHttpRequestToLocalServer(`/cache/str/delay/${appInfo.id}`, {
    jsonData: {
      key,
      expire
    }
  })
}
