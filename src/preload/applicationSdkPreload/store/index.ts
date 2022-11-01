import {
  tryJsonParseDataHandler,
  sendInvokeIpcEventWrapperEventNameAndDataCallBack
} from '../tools'

const sendInvokeIpcEvent = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'store',
  tryJsonParseDataHandler
)

export const store = {
  set(key: string, val: any): Promise<void> {
    if (typeof val !== 'string') {
      val = JSON.stringify(val)
    }

    return sendInvokeIpcEvent('set', key, val)
  },
  async get(key: string, defaultValue?: any): Promise<any> {
    const response = await sendInvokeIpcEvent('get', key, defaultValue)
    if (typeof response !== 'undefined') {
      return response
    }
    return defaultValue
  },
  has(key: string): Promise<boolean> {
    return sendInvokeIpcEvent('has', key)
  },
  delete(key: string): Promise<void> {
    return sendInvokeIpcEvent('delete', key)
  },
  clear(): Promise<void> {
    return sendInvokeIpcEvent('clear')
  }
}
