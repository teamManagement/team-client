import { sendHttpRequestToLocalServer } from '../../../tools'
import { AppInfo } from '../../insideSdk/applications'

interface BroadcastNotificationInfo {
  title?: string
  body?: string
}

interface AckNotificationInfo extends BroadcastNotificationInfo {
  /**
   * title点击时则打开应用
   */
  openInTitle?: boolean
  /**
   * 点击body则打开应用
   */
  openInBody?: boolean
  /**
   * 显示打开应用按钮
   */
  showOpenBtn?: boolean
}

interface MsgContent {
  content: string
  meta?: any
  option?: {
    /**
     * 签收模式
     */
    ackNotificationModal?: 'auto' | 'show' | 'hide' | 'custom'
    /**
     * 签收时的notification通知消息内容
     */
    ackNotification?: AckNotificationInfo
    /**
     * 通知内容
     */
    notification?: BroadcastNotificationInfo | boolean
  }
}

async function _broadcastAppMsg(
  appId: string,
  appMsgContent: string | MsgContent,
  targetUserId: string[]
): Promise<string[]> {
  if (!appMsgContent) {
    throw new Error('缺失推送信息')
  }
  if (typeof appMsgContent === 'string') {
    appMsgContent = { content: appMsgContent }
  }

  appMsgContent.option = appMsgContent.option || {}
  if (typeof appMsgContent.option.notification === 'undefined') {
    appMsgContent.option.notification = false
  }

  if (typeof appMsgContent.option.ackNotificationModal !== 'boolean') {
    appMsgContent.option.ackNotificationModal = 'auto'
  }

  if (!appMsgContent) {
    throw new Error('消息内容不能为空')
  }

  if (!appMsgContent.content) {
    throw new Error('缺失消息内容')
  }

  const sendData = {
    targetUserId,
    appId,
    content: appMsgContent
  }

  return sendHttpRequestToLocalServer('/services/channel/broadcast/appMsg', {
    jsonData: sendData,
    timeout: -1
  })
}

const channelMap = {
  /**
   * 广播应用消息
   * @param targetUserId 广播到的用户ID
   */
  async broadcastAppMsg(
    appInfo: AppInfo,
    msgInfo: MsgContent,
    targetUserId: string[]
  ): Promise<string[]> {
    return _broadcastAppMsg(appInfo.id, msgInfo, targetUserId)
  }
  // /**
  //  * 广播用户ID
  //  * @param msgInfo 消息
  //  * @param targetUserId 目标用户ID
  //  */
  // async broadcastAppMsgWithNotification(
  //   appInfo: AppInfo,
  //   content: any,
  //   targetUserId: string[],
  //   notificationInfo?: BroadcastNotificationInfo
  // ): Promise<string[]> {
  //   return _broadcastAppMsg(appInfo.id, content, notificationInfo || true, targetUserId)
  // }
}

export function _channelHandler(appInfo: AppInfo, eventName: string, ...data: any): Promise<any> {
  const handler = channelMap[eventName]
  if (!handler) {
    throw new Error('未知的channel指令')
  }
  return handler(appInfo, ...data)
}
