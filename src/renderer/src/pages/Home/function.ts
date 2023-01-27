import { api, insideDb } from '@teamworktoolbox/inside-sdk'
import { current } from '@teamworktoolbox/sdk'
import { ignoreErrorWrapper } from '@renderer/tools'
import { pinyin } from 'pinyin-pro'
import { message } from 'tdesign-react'
import { ChatMsgType, ChatType, DataSourceMeta, UserChatMsg } from './hooks'

export function addUnreadMsg(msg: UserChatMsg): void {
  const currentUserInfo = current.userInfo
  switch (msg.chatType) {
    case ChatType.ChatTypeUser:
      if (msg.targetId !== currentUserInfo.id) {
        return
      }
      // insideDb.syn
      //   insideDb.insideDb.sync.put()
      return
    case ChatType.ChatTypeGroup:
      console.warn('暂不支持的消息类型')
      return
    case ChatType.ChatTypeApp:
      console.warn('暂不支持的消息类型')
      return
    default:
      console.log('未被识别的消息类型')
      return
  }
}

// #region 通信对象搜索相关

/**
 * 搜索结果过滤
 * @param rawDataSource 原始数据源
 * @param keywords 要过滤的关键字
 * @returns 过滤之后的数据列表
 */
export function searchResultFilter<T extends { name: string; username?: string }>(
  rawDataSource: T[],
  keywords: string
): { raw: T; pinyinComplete: string; pinyinFirst: string }[] {
  if (!rawDataSource || rawDataSource.length === 0) {
    return []
  }

  return rawDataSource
    .map((raw) => {
      const pinyinComplete = pinyin(raw.name, { toneType: 'none', type: 'string' }).replaceAll(
        ' ',
        ''
      )
      const pinyinFirst = pinyin(raw.name, {
        toneType: 'none',
        type: 'string',
        pattern: 'first'
      }).replaceAll(' ', '')
      return {
        pinyinFirst,
        pinyinComplete,
        raw
      }
    })
    .filter((r) => {
      return (
        r.raw.name.includes(keywords) ||
        r.pinyinComplete.includes(keywords) ||
        r.pinyinFirst.includes(keywords) ||
        (r.raw.username && r.raw.username.includes(keywords))
      )
    })
}

// #endregion

// #region 通信卡片相关方法
export interface MessageInfo {
  id: string
  type: 'users' | 'groups' | 'apps'
  name: string
  desc?: string
  icon?: string
  endMessageTime?: string
  endMessage?: string
  unreadMessageNum?: number
  sourceData: DataSourceMeta
  indexInfo: {
    dataType: 'userMessage'
    updateAt: Date
  }
  _id: string
  _rev?: string
}

/**
 * 查询消息信息列表
 * @returns 消息信息列表
 */
export async function queryMessageDataList(): Promise<MessageInfo[]> {
  try {
    const messageList = (
      await insideDb.index.find<MessageInfo>({
        selector: { 'indexInfo.dataType': 'userMessage', 'indexInfo.updateAt': { $gte: null } },
        sort: [{ 'indexInfo.updateAt': 'desc' }]
      })
    ).docs
    await loadMessageDataListEndMsg(messageList)
    return messageList
  } catch (e) {
    console.warn('查询消息卡片列表失败: ', e)
    return []
  }
}

/**
 * 根据ID删除消息卡片
 * @param id 要删除的Id
 */
export async function deleteMessageDataById(id: string): Promise<void> {
  try {
    await insideDb.remove(id)
  } catch (e) {
    console.warn('删除消息卡片失败: ', e)
    return
  }
}

export async function errorSendingToLoading(clientUniqueId: string): Promise<void> {
  if (!clientUniqueId) {
    throw new Error('id不存在')
  }

  const userChatMsgData = await insideDb.get<UserChatMsgTableInfo>(getSendingId(clientUniqueId))
  await insideDb.remove(userChatMsgData._id)
  delete (userChatMsgData as any)['_rev']

  userChatMsgData.chatData.status = 'loading'
  userChatMsgData.chatData.errMsg = ''
  await insideDb.put(userChatMsgData)
}

export interface UserChatMsgTableInfo {
  chatData: UserChatMsg
  indexInfo: {
    dataType: string
    updateAt: string
  }
}

function getSendingId(clientUniqueId: string): string {
  return 'sending_msg_' + clientUniqueId
}

export async function getSendingUserChatMsg(id: string): Promise<UserChatMsg | undefined> {
  try {
    return (await insideDb.get<UserChatMsgTableInfo>(getSendingId(id))).chatData
  } catch (e) {
    return undefined
  }
}

export function saveSendingChatMsgInfo(chatMsg: UserChatMsg): UserChatMsg {
  ignoreErrorWrapper(() => {
    insideDb.sync.remove(chatMsg.clientUniqueId)
  })
  try {
    insideDb.sync.put({
      _id: getSendingId(chatMsg.clientUniqueId),
      chatData: chatMsg,
      indexInfo: {
        dataType: 'sending_msg_' + chatMsg.chatType + '_' + chatMsg.targetId,
        updateAt: new Date()
      }
    })
  } catch (e) {
    message.error('保存发送数据失败, 请重新发送, 本次错误: ' + JSON.stringify(e))
    throw e
  }
  return chatMsg
}

export async function sendingMsgHaveError(id: string, errMsg: string): Promise<void> {
  try {
    const sendingChatMsgId = getSendingId(id)
    const userChatMsg = await insideDb.get<UserChatMsgTableInfo>(sendingChatMsgId)
    if (!userChatMsg) {
      return
    }
    await insideDb.remove(sendingChatMsgId)

    userChatMsg.chatData.status = 'error'
    userChatMsg.chatData.errMsg = errMsg
    ;(userChatMsg as any)._rev = undefined
    await insideDb.put(userChatMsg)
  } catch (e) {
    console.warn('更新消息状态为错误失败')
  }
}

export function confirmSendingChatMsgInfo(chatMsg: UserChatMsg): void {
  insideDb.sync.remove(getSendingId(chatMsg.clientUniqueId))
}

export async function deleteChatMsg(chatMsgId: string): Promise<void> {
  try {
    const msgId = getSendingId(chatMsgId)
    const msgInfo = await insideDb.get<UserChatMsgTableInfo>(msgId)
    if (!msgInfo.indexInfo.dataType.startsWith('sending_msg_')) {
      throw new Error('未能被识别的消息类型')
    }

    if (msgInfo.chatData.status !== 'error') {
      throw new Error('当前消息状态无法进行删除')
    }

    await insideDb.remove(msgId)
  } catch (e) {
    console.error('获取要删除的消息失败: ', e)
    throw e
  }
}

export async function querySendingChatMsgInfoList(
  chatType: ChatType,
  targetId: string
): Promise<UserChatMsg[]> {
  const messageList = await insideDb.index.find<UserChatMsgTableInfo>({
    selector: {
      'indexInfo.dataType': 'sending_msg_' + chatType + '_' + targetId,
      'indexInfo.updateAt': { $gte: null }
    },
    sort: [{ 'indexInfo.updateAt': 'asc' }]
  })

  return messageList.docs.map((m) => {
    return m.chatData
  })
  // console.log(messageList)
  // return messageList
}

// export function filterSendingChatMsgList(msgList: UserChatMsg[], targetId: string): UserChatMsg {
//   api.proxyHttpLocalServer('')
// }

export async function loadMessageDataListEndMsg(
  messageDataList: MessageInfo[]
): Promise<MessageInfo[]> {
  for (let i = 0; i < messageDataList.length; i++) {
    const msgInfo = messageDataList[i]
    const requestUrl = `/services/chat/msg/query/end/${msgInfo.id}?num=1`
    const resp = await api.proxyHttpLocalServer<UserChatMsg[]>(requestUrl, { timeout: -1 })
    if (resp && resp.length > 0) {
      const msg = resp[0]
      let content = msg.content
      if (msg.msgType === ChatMsgType.ChatMsgTypeFile) {
        content = '[文件]'
      } else if (msg.msgType === ChatMsgType.ChatMsgTypeImg) {
        content = '[图片]'
      }
      msgInfo.endMessage = content
      msgInfo.endMessageTime = msg.createdAt
    }
  }
  return messageDataList
}

/**
 * 查询当前的消息信息
 * @returns 当前的消息信息
 */
export function queryCurrentMessageInfo(): MessageInfo | undefined {
  try {
    return insideDb.sync.get('current_userMessage')
  } catch (e) {
    console.warn(e)
    return undefined
  }
}

/**
 * 设置当前的消息信息
 * @param messageInfo 要设置的当前消息信息
 */
export function settingCurrentMessageInfo(messageInfo?: MessageInfo): void {
  try {
    ignoreErrorWrapper(() => {
      insideDb.sync.remove('current_userMessage')
    })
    if (!messageInfo) {
      return
    }
    insideDb.sync.put({
      ...messageInfo,
      indexInfo: undefined,
      _id: 'current_userMessage',
      _rev: undefined
    })
  } catch (e) {
    console.error(e)
  }
}

export function putMessageInfoAndSettingCurrent(messageInfo: MessageInfo): void {
  try {
    ignoreErrorWrapper(() => {
      insideDb.sync.remove(messageInfo._id)
    })
    insideDb.sync.put({
      ...messageInfo,
      indexInfo: {
        dataType: 'userMessage',
        updateAt: new Date()
      },
      _rev: undefined
    } as MessageInfo)
    settingCurrentMessageInfo(messageInfo)
  } catch (e) {
    console.error(e)
  }
}

export interface MessageInfoMap {
  [key: string]: MessageInfo
}

/**
 * 转换消息列表到map
 * @param messageInfoList 要转换的消息列表
 * @returns 消息Map
 */
export function convertMessageInfoListToMessageInfoMap(
  messageInfoList: MessageInfo[]
): MessageInfoMap {
  const result: MessageInfoMap = {}
  if (!messageInfoList) {
    return result
  }

  messageInfoList.forEach((m) => {
    result[m.id] = m
  })

  return result
}

// #endregion
