import { tryJsonParseDataHandler } from '../../_commons/tools'
import { sendInvokeIpcEventWrapperEventNameAndDataCallBack } from '../tools'

const sendInvokeIpcEventWithNoDataHandler = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'channel',
  tryJsonParseDataHandler
)

export const channel = {
  broadcastAppMsg(msgInfo: any, targetUserId: string[]): Promise<any> {
    const msgType = typeof msgInfo
    if (msgType !== 'string' && msgType !== 'object') {
      throw new Error('缺失要推送的消息信息')
    }
    return sendInvokeIpcEventWithNoDataHandler('broadcastAppMsg', msgInfo, targetUserId)
  }
  // broadcastAppMsgWithNotification(msgInfo: any, targetUserId: string | MsgContent): Promise<any> {
  //   return sendInvokeIpcEventWithNoDataHandler(
  //     'broadcastAppMsgWithNotification',
  //     msgInfo,
  //     targetUserId,
  //     notificationInfo
  //   )
  // }
}
