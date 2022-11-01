import { currentInfo } from '../current'
import {
  sendInvokeIpcEventWrapperEventNameAndDataCallBack,
  tryJsonParseDataHandler
} from '../tools'

const sendInvokeIpcEvent = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'cache',
  tryJsonParseDataHandler
)
export const file = {
  /**
   * 创建文件缓存
   * @param localPath 本地文件路径
   * @param expire 有效期(单位毫秒), 0: 默认10分钟， -1: 永不过期
   * @returns 缓存ID
   */
  store(localPath: string, expire?: number): Promise<string> {
    return sendInvokeIpcEvent('file.store', localPath, expire)
  },
  /**
   * 删除文件缓存
   * @param cacheId 文件缓存ID
   */
  delete(cacheId: string): Promise<void> {
    return sendInvokeIpcEvent('file.delete', cacheId)
  },
  /**
   * 清空文件缓存
   */
  clear(): Promise<void> {
    return sendInvokeIpcEvent('file.clear')
  },
  /**
   * 获取文件下载路径
   * @param cacheId 缓存Id
   * @returns 文件下载路径
   */
  getDownloadUrl(cacheId: string): string {
    if (!cacheId) {
      throw new Error('文件缓存ID不能为空')
    }
    return `https://127.0.0.1:65528/cache/file/download/${currentInfo.id}/${cacheId}`
  }
}
