import { tryJsonParseDataHandler } from '../../_commons/tools'
import { sendInvokeIpcEventWrapperEventNameAndDataCallBack } from '../tools'

const sendInvokeIpcEvent = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'proxy',
  tryJsonParseDataHandler
)

export const proxy = {
  isEnabled443(): Promise<boolean> {
    return sendInvokeIpcEvent('isEnabled443')
  },
  enable443(): Promise<void> {
    return sendInvokeIpcEvent('enable443')
  },
  disable443(): Promise<void> {
    return sendInvokeIpcEvent('disable443')
  }
}
