import { ChatGroupInfo } from '@byzk/teamwork-inside-sdk'
import { AppInfo, UserInfo } from '@byzk/teamwork-sdk'

export enum ChatType {
  // 用户<->用户
  ChatTypeUser = 1,
  // 用户<->群组
  ChatTypeGroup,
  // 用户<->App
  ChatTypeApp
}

export enum ChatMsgType {
  // 文本聊天消息
  ChatMsgTypeText = 1,
  // 文件消息
  ChatMsgTypeFile,
  // 图片消息
  ChatMsgTypeImg
}

export interface UserChatMsg {
  /**
   * 唯一ID
   */
  id: string
  /**
   * 目标ID
   */
  targetId: string
  /**
   * 目标信息
   */
  targetInfo?: UserInfo | ChatGroupInfo | AppInfo
  /**
   * 发送者ID
   */
  sourceId: string
  /**
   * 发送者信息
   */
  sourceInfo?: UserInfo | ChatGroupInfo | AppInfo
  /**
   * 内容
   */
  content: string
  /**
   * 当消息内容为文件类型时, 存放图标
   */
  fileIcon: string
  /**
   * 聊天类型
   */
  chatType: ChatType
  /**
   * 消息类型
   */
  msgType: ChatMsgType
  /**
   * 创建时间
   */
  createdAt: string
  /**
   * 最后更新时间
   */
  updatedAt: string
  /**
   * 客户端唯一ID
   */
  clientUniqueId: string
  /**
   * 状态
   */
  status?: 'loading' | 'error' | 'ok'
  /**
   * 错误消息
   */
  errMsg?: string
}
