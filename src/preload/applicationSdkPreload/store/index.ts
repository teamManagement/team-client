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
  get(key: string, defaultValue?: any): Promise<any> {
    if (defaultValue) {
      defaultValue = JSON.stringify(defaultValue)
    }
    return sendInvokeIpcEvent('get', key, defaultValue)
  },
  has(key: string): Promise<boolean> {
    return sendInvokeIpcEvent('hash', key)
  },
  delete(key: string): Promise<void> {
    return sendInvokeIpcEvent('delete', key)
  },
  clear(): Promise<void> {
    return sendInvokeIpcEvent('clear')
  }
}
