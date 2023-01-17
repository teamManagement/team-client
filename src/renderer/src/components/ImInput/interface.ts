/**
 * 消息类型
 * */
export enum EMsgType {
  text = 'TEXT',
  img = 'IMG',
  file = 'file'
}

/**
 * 聊天类型
 * */
export enum ECharType {
  single = 'singleMsg',
  group = 'groupMsg'
}

/**
 * 定义文件结构
 * */
export interface IFilePayload {
  fileRealName: string
  fileSize: number
  type: string
  fileUrl?: string // 网络路径
  localPath?: string // 本地路径electron会有
  file?: File // web端会有
}

/**
 * 定义基本消息结构
 * */
export interface EMsgItem {
  type: EMsgType
  data: string | IFilePayload | undefined
}

/**
 * 表情
 * */
export interface IEmojiItem {
  key: string
  data: string
}

/**
 * 成员
 * */
export interface IMemberItem {
  id: string
  name: string
  avatar: string
}

export default {}
