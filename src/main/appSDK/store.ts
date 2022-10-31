import Store from 'electron-store'
import { AppInfo } from '../applications/manager'
import logs from 'electron-log'

const store = new Store({
  encryptionKey: 'aes-256-cbc',
  clearInvalidConfig: true,
  fileExtension: 'store'
})
logs.debug('store 文件存储路径: ', store.path)

type StoreEventName = 'set' | 'get' | 'has' | 'delete' | 'clear'
export function _storeHandler(
  appInfo: AppInfo,
  eventName: StoreEventName,
  ...data: any
): Promise<any> {
  switch (eventName) {
    case 'set':
      return set(appInfo, data[0], data[1])
    case 'get':
      return get(appInfo, data[0], data[1])
    case 'has':
      return has(appInfo, data[0])
    case 'delete':
      return deleteKey(appInfo, data[0])
    case 'clear':
      return clear(appInfo)
    default:
      return Promise.reject('非法的数据存储API')
  }
}

function _getStoreKey(appInfo: AppInfo, key: string): string {
  if (typeof key === 'undefined' || key === '') {
    throw new Error('缺失store的key')
  }
  return `_${appInfo.id}.${key}`
}

/**
 * 存储
 * @param appInfo 应用信息
 * @param key key
 * @param value value
 */
async function set(appInfo: AppInfo, key: string, value: any): Promise<void> {
  if (typeof key === 'undefined') {
    throw new Error('无法存储undefined数据, 如要删除请调用delete方法')
  }

  store.set(_getStoreKey(appInfo, key), value)
}

/**
 * 获取存储内容
 * @param appInfo 应用信息
 * @param key key
 * @param defaultValue 默认value
 * @returns value
 */
async function get(appInfo: AppInfo, key: string, defaultValue?: string): Promise<string> {
  return store.get(_getStoreKey(appInfo, key), defaultValue) as any
}

/**
 * 判断是否存在key
 * @param appInfo 应用信息
 * @param key key
 * @returns 是否存在
 */
async function has(appInfo: AppInfo, key: string): Promise<boolean> {
  return store.has(_getStoreKey(appInfo, key))
}

/**
 * 删除存储key
 * @param app 应用信息
 * @param key key
 */
async function deleteKey(app: AppInfo, key: string): Promise<void> {
  if (!key || key.length === 0) {
    return
  }
  store.delete(_getStoreKey(app, key))
}

async function clear(appInfo: AppInfo): Promise<void> {
  store.delete('_' + appInfo.id)
}
