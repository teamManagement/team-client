import {
  sendInvokeIpcEventWrapperEventNameAndDataCallBack,
  tryJsonParseDataHandler
} from '../tools'

const sendInvokeIpcEvent = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'cache',
  tryJsonParseDataHandler
)

export const strCache = {
  /**
   *
   * @param key key
   * @param value value
   * @param expire 有效期
   */
  set(key: string, value: any, expire?: number): Promise<void> {
    try {
      value = JSON.stringify(value)
    } catch (e) {
      return Promise.reject('不支持的Value类型')
    }
    return sendInvokeIpcEvent('default.store', key, value, expire)
  },

  /**
   * 获取缓存的Value
   * @param key 缓存的KEY
   * @param defaultValue 默认值
   */
  async get<T>(key: string, defaultValue?: any): Promise<T> {
    const response = await sendInvokeIpcEvent('default.get', key)
    if (typeof response === 'undefined') {
      return defaultValue
    }
    return response
  },
  /**
   * 删除缓存
   * @param key 要删除的key
   */
  delete(key: string): Promise<void> {
    return sendInvokeIpcEvent('default.delete', key)
  },
  /**
   * 清空缓存
   */
  clear(): Promise<void> {
    return sendInvokeIpcEvent('default.clear')
  },
  /**
   * 是否存在对应的缓存
   * @param key 缓存Key
   * @returns 是/否存在
   */
  has(key: string): Promise<boolean> {
    return sendInvokeIpcEvent('default.has', key)
  },
  /**
   * 重新设置过期时间
   * @param key 缓存Key
   * @param expire 过期时间
   * @returns 是/否成功
   */
  delay(key: string, expire?: number): Promise<void> {
    return sendInvokeIpcEvent('default.delay', key, expire)
  }
}
