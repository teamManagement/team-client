import { sendHttpRequestToLocalServer } from '../../../tools'
import { AppInfo } from '../../insideSdk/applications'

// const store = new Store({
//   encryptionKey: 'aes-256-cbc',
//   clearInvalidConfig: true,
//   fileExtension: 'store'
// })
// logs.debug('store 文件存储路径: ', store.path)

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
      return get(appInfo, data[0])
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

/**
 * 存储
 * @param appInfo 应用信息
 * @param key key
 * @param value value
 */
function set(appInfo: AppInfo, key: string, value: any): Promise<void> {
  if (typeof key === 'undefined') {
    throw new Error('无法存储undefined数据, 如要删除请调用delete方法')
  }

  return sendHttpRequestToLocalServer(`/app/store/set/${appInfo.id}`, {
    jsonData: {
      name: key,
      value: JSON.stringify(value)
    }
  })
}

/**
 * 获取存储内容
 * @param appInfo 应用信息
 * @param key key
 * @param defaultValue 默认value
 * @returns value
 */
async function get(appInfo: AppInfo, key: string): Promise<string | undefined> {
  const response = await sendHttpRequestToLocalServer<string>(
    `/app/store/get/${appInfo.id}?name=${key}`
  )
  if (typeof response !== 'undefined') {
    return JSON.parse(response)
  }
  return undefined
}

/**
 * 判断是否存在key
 * @param appInfo 应用信息
 * @param key key
 * @returns 是否存在
 */
function has(appInfo: AppInfo, key: string): Promise<boolean> {
  return sendHttpRequestToLocalServer(`/app/store/has/${appInfo.id}?name=${key}`)
}

/**
 * 删除存储key
 * @param app 应用信息
 * @param key key
 */
async function deleteKey(appInfo: AppInfo, key: string): Promise<void> {
  if (!key || key.length === 0) {
    return
  }
  return sendHttpRequestToLocalServer(`/app/store/delete/${appInfo.id}?name=${key}`)
}

async function clear(appInfo: AppInfo): Promise<void> {
  return sendHttpRequestToLocalServer(`/app/store/clear/${appInfo.id}`)
}
