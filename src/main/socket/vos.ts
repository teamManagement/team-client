export enum MessageType {
  /**
   * 开始标识不做业务使用
   */
  start,
  // 聊天消息
  chatMsg,
  // 应用信息
  applicationMsg,
  /**
   * 结束标识，不做业务使用
   */
  End
}

export interface MessageInfo<T> {
  id: string
  // Type 消息类型
  type: MessageType
  // Content 消息内容
  content: T
  // TargetId 目标ID
  targetId: string
  // SenderId 发送者ID
  senderId: string
}
