import { AppInfo } from '../../applications/manager'
import { sendHttpRequestToLocalServer } from '../../tools'

type EventName = 'store' | 'delete' | 'clear' | 'delay'

export function _fileCacheHandler(
  appInfo: AppInfo,
  eventName: EventName,
  ...data: any
): Promise<any> {
  switch (eventName) {
    case 'store':
      return fileStore(appInfo, data[0], data[1])
    case 'delete':
      return fileDelete(appInfo, data[0])
    case 'clear':
      return fileClear(appInfo)
    case 'delay':
      return fileDelay(appInfo, data[0], data[1])
    default:
      return Promise.reject(new Error('不支持的文件缓存指令'))
  }
}

/**
 * 创建文件缓存
 * @param appInfo 应用信息
 * @param localFilePath 本地文件路径
 * @param expire 有效期(单位毫秒), 0: 默认10分钟， -1: 永不过期
 * @returns 缓存id
 */
function fileStore(appInfo: AppInfo, localFilePath: string, expire?: number): Promise<string> {
  if (!localFilePath) {
    return Promise.reject(new Error('要缓存的文件路径不能为空'))
  }

  return sendHttpRequestToLocalServer('/cache/file/store', {
    jsonData: {
      path: localFilePath,
      appId: appInfo.id,
      expire
    }
  })
}

/**
 * 删除文件缓存
 * @param appInfo 应用信息
 * @param cacheId 缓存ID
 */
function fileDelete(appInfo: AppInfo, cacheId: string): Promise<void> {
  if (!cacheId) {
    return Promise.reject(new Error('缺失文件缓存ID'))
  }

  return sendHttpRequestToLocalServer(`/cache/file/del/${appInfo.id}/${cacheId}`)
}

/**
 * 清空文件缓存
 * @param appInfo 应用信息
 */
function fileClear(appInfo: AppInfo): Promise<void> {
  return sendHttpRequestToLocalServer(`/cache/file/clear/${appInfo.id}`)
}

/**
 * 文件缓存延期
 * @param appInfo 应用信息
 * @param cacheId 缓存ID
 * @param expire 新的过期时间
 */
function fileDelay(appInfo: AppInfo, cacheId: string, expire?: number): Promise<boolean> {
  return sendHttpRequestToLocalServer(`/cache/file/delay/${cacheId}`, {
    jsonData: {
      appId: appInfo.id,
      expire
    }
  })
}
