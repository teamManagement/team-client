import {
  sendInvokeIpcEventWrapperEventNameAndDataCallBack,
  sendSyncIpcEventWrapperEventNameAndDataCallBack
} from '../tools'

const sendInvokeIpcEventWithNoDataHandler = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'encoding',
  undefined
)

const sendSyncIpcEventWithNoDataHandler = sendSyncIpcEventWrapperEventNameAndDataCallBack(
  'encoding.sync',
  undefined
)

const eventNameBase64 = 'base64'
const eventNameBase64Decode = 'base64Decode'
const eventNameHex = 'hex'
const eventNameHexDecode = 'hexDecode'

export const encoding = {
  base64(str: string): Promise<string> {
    return sendInvokeIpcEventWithNoDataHandler(eventNameBase64, str)
  },
  base64Decode(base64Str: string): Promise<string> {
    return sendInvokeIpcEventWithNoDataHandler(eventNameBase64Decode, base64Str)
  },
  hex(str: string): Promise<string> {
    return sendInvokeIpcEventWithNoDataHandler(eventNameHex, str)
  },
  hexDecode(hexStr: string): Promise<string> {
    return sendInvokeIpcEventWithNoDataHandler(eventNameHexDecode, hexStr)
  },
  sync: {
    base64(str: string): string {
      return sendSyncIpcEventWithNoDataHandler(eventNameBase64, str)
    },
    base64Decode(base64Str: string): Promise<string> {
      return sendSyncIpcEventWithNoDataHandler(eventNameBase64Decode, base64Str)
    },
    hex(str: string): Promise<string> {
      return sendSyncIpcEventWithNoDataHandler(eventNameHex, str)
    },
    hexDecode(hexStr: string): Promise<string> {
      return sendSyncIpcEventWithNoDataHandler(eventNameHexDecode, hexStr)
    }
  }
}
