export enum QueueMsgType {
  /**
   * 确认
   */
  CONFIRM,
  /**
   * 消息推送
   */
  SEND_OUT
}

export interface QueueMsgInfo {
  /**
   * 消息类型
   */
  type: QueueMsgType
  /**
   * 内容
   */
  content: string
  /**
   * 附加属性
   */
  meta?: { [key: string]: string }
  /**
   * 发送时间
   */
  sendTime: string
}
