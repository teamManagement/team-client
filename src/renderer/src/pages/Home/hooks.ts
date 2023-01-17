import { useCallback, useEffect, useRef, useState } from 'react'
import localforage from 'localforage'
import AsyncLock from 'async-lock'
import { api, ChatGroupInfo, remoteCache } from '@byzk/teamwork-inside-sdk'
import { AppInfo, UserInfo } from '@byzk/teamwork-sdk'
import { SearchResult } from '@renderer/components/SearchInput/searchInput'
import {
  convertMessageInfoListToMessageInfoMap,
  deleteMessageDataById,
  MessageInfo,
  MessageInfoMap,
  putMessageInfoAndSettingCurrent,
  queryCurrentMessageInfo,
  queryMessageDataList,
  searchResultFilter,
  settingCurrentMessageInfo
} from './function'

const _lock = new AsyncLock()

// #region 通信对象搜索相关hook

/**
 * 数据源中的元数据
 */
export interface DataSourceMeta {
  /**
   * 拼音
   */
  pinyin: string
  /**
   * 拼音首字母
   */
  pinyinFirst: string
  /**
   * 类型
   */
  type: 'users' | 'groups' | 'apps'
  /**
   * 名称
   */
  sourceName?: string
  /**
   * 数据源的真实数据
   */
  metadata: UserInfo | AppInfo | ChatGroupInfo
}

/**
 * 使用查询结果列表
 * @returns [查询结果, 是否正在加载, 关键字]
 */
export function useSearchResultList(): [
  SearchResult<DataSourceMeta>[],
  boolean,
  (keywords: string) => void
] {
  const [loading, setLoading] = useState<boolean>(false)
  const [dataSource, setDataSource] = useState<SearchResult<DataSourceMeta>[]>([])

  const queryDataSource = useCallback(async (keywords: string) => {
    try {
      setLoading(true)

      const dataSource: SearchResult<DataSourceMeta>[] = []

      const appList =
        (await api.proxyHttpLocalServer<AppInfo[]>('services/resources/app/list', {
          timeout: -1
        })) || []

      searchResultFilter(appList, keywords).forEach((r) => {
        const app = r.raw
        dataSource.push({
          id: app.id,
          icon: app.icon,
          typeId: 'apps',
          name: app.name,
          desc: app.desc,
          metaData: {
            pinyin: r.pinyinComplete,
            pinyinFirst: r.pinyinFirst,
            type: 'apps',
            metadata: app
          }
        })
      })

      const userList = await remoteCache.userList()
      searchResultFilter(userList, keywords).forEach((r) => {
        const user = r.raw
        let desc = ''
        if (user.orgList) {
          for (const o of user.orgList) {
            desc += o.org.name + ','
          }
        }

        if (desc.length > 0) {
          desc = desc.substring(0, desc.length - 1)
          desc = '部门: ' + desc
        }

        dataSource.push({
          id: user.id,
          name: `${user.name}( ${user.username} )`,
          typeId: 'users',
          icon: user.icon,
          iconName: user.name,
          desc,
          metaData: {
            pinyin: r.pinyinComplete,
            pinyinFirst: r.pinyinFirst,
            metadata: user,
            type: 'users',
            sourceName: user.name
          }
        })
      })

      setDataSource(dataSource)
    } catch (e) {
      // nothing
    } finally {
      setLoading(false)
    }
  }, [])

  return [dataSource, loading, queryDataSource]
}
// #endregion

//#region 通信卡片相关方法

const _chatMsgListLen = 30

const _chatMsgListLocalForageKey = 'chat_msg_list'

/**
 * 获取聊天消息列表的本地存储key
 * @param targetId 目标ID
 * @returns 本地存储key
 */
function getChatMsgLitLocalForageKey(targetId: string): string {
  return targetId + '_' + _chatMsgListLocalForageKey
}

/**
 * 聊天类别
 */
export enum ChatType {
  // 用户<->用户
  ChatTypeUser = 1,
  // 用户<->群组
  ChatTypeGroup,
  // 用户<->App
  ChatTypeApp
}

/**
 * 聊天消息类别
 */
export enum ChatMsgType {
  // 文本聊天消息
  ChatMsgTypeText = 1,
  // 文件消息
  ChatMsgTypeFile,
  // 图片消息
  ChatMsgTypeImg
}

/**
 * 用户聊天消息
 */
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

/**
 * 打开聊天信息卡片的信息
 */
export type OpenChatMessageCardInfo = {
  /**
   * 聊天类型
   */
  type: 'users' | 'groups' | 'apps'
  /**
   * 信息
   */
  info: {
    /**
     * id
     */
    id: string
    /**
     * 名称
     */
    name: string
    /**
     * 描述
     */
    desc?: string
    /**
     * 图标
     */
    icon?: string
    /**
     * 源数据
     */
    sourceData: any
  }
}

/**
 * 聊天消息hook返回类型
 */
export interface ChatMessageCardHookReturnType {
  /**
   * 消息信息列表
   */
  messageInfoList: MessageInfo[]
  /**
   * 当前已打开的消息信息
   */
  currentMessageInfo?: MessageInfo
  /**
   * 当前用户的消息列表
   */
  currentChatMessageList: UserChatMsg[]
  /**
   * 当前消息列表是否正在加载
   */
  currentChatMsgListLoading: boolean
  /**
   * 切换当前消息信息
   * @param info 要切换的消息信息
   */
  convertCurrentMessageInfo(info: MessageInfo): void
  /**
   * 打开聊天信息卡片
   */
  openChatMessageCard(messageInfo: OpenChatMessageCardInfo): void
  /**
   * 关闭聊天卡片卡片
   * @param messageInfo 要关闭的信息
   */
  closeChatMessageCard(messageInfo: MessageInfo): void
  /**
   * 重新查询消息列表
   * @param targetId 目标ID
   */
  retryQueryCurrentMessageList(targetId: string): Promise<void>
}

/**
 *
 * @returns 消息
 */
export function useChatMessageOperation(): ChatMessageCardHookReturnType {
  const currentChatMsgListLoadAll = useRef<boolean>(false)
  const currentChatMsgListFirstLoad = useRef<boolean>(true)
  const [currentChatMsgListLoading, setCurrentChatMsgListLoading] = useState<boolean>(false)

  const [messageInfoList, setMessageInfoList] = useState<MessageInfo[]>([])

  const messageInfoMap = useRef<MessageInfoMap>({})

  const [currentMessageInfo, setCurrentMessageInfo] = useState<MessageInfo | undefined>(undefined)

  const [currentChatMessageList, setCurrentChatMessageList] = useState<UserChatMsg[]>([])

  const restMessageInfo = useCallback(() => {
    _lock.acquire('rest_message_info', async (done) => {
      try {
        const msgInfoList = await queryMessageDataList()
        setMessageInfoList([...msgInfoList])
        messageInfoMap.current = convertMessageInfoListToMessageInfoMap(msgInfoList)
        setCurrentMessageInfo(queryCurrentMessageInfo())
        currentChatMsgListLoadAll.current = false
        currentChatMsgListFirstLoad.current = true
      } finally {
        done()
      }
    })
  }, [])

  useEffect(() => {
    restMessageInfo()
  }, [])

  const queryCurrentMessageList = useCallback(
    async (targetId: string) => {
      if (currentChatMsgListLoadAll.current) {
        return
      }

      const localforageKey = getChatMsgLitLocalForageKey(targetId)

      await _lock.acquire(localforageKey, async (done) => {
        try {
          setCurrentChatMsgListLoading(true)
          let localChatMsgList: UserChatMsg[] | undefined = undefined
          try {
            const jsonStr = await localforage.getItem<string>(localforageKey)
            if (jsonStr) {
              localChatMsgList = JSON.parse(jsonStr)
            }
          } catch (e) {
            //nothing
          }
          const isFirstLoad = currentChatMsgListFirstLoad.current

          let localRequestUrl = `/services/chat/msg/query/end/${targetId}?num=${_chatMsgListLen}`

          if (localChatMsgList && localChatMsgList.length > 0) {
            if (isFirstLoad) {
              if (localChatMsgList.length > _chatMsgListLen) {
                localChatMsgList = localChatMsgList.slice(localChatMsgList.length - _chatMsgListLen)
              }
              localChatMsgList = localChatMsgList || []
              setCurrentChatMessageList(localChatMsgList)
              await localforage.setItem(localforageKey, JSON.stringify(localChatMsgList))
              return
            }
            localRequestUrl += `&&end=${localChatMsgList[0].clientUniqueId}&&reverse=1`
          }

          try {
            const response: UserChatMsg[] = await api.proxyHttpLocalServer(localRequestUrl, {
              timeout: -1
            })
            if (!response || response.length === 0) {
              currentChatMsgListLoadAll.current = true
              console.log('加载完毕')
              return
            }
            if (localChatMsgList && localChatMsgList.length > 0) {
              localChatMsgList.unshift(...response)
            } else {
              localChatMsgList = response
            }
            setCurrentChatMessageList(localChatMsgList)
            await localforage.setItem(localforageKey, JSON.stringify(localChatMsgList))
          } catch (e) {
            //nothing
          }
        } finally {
          currentChatMsgListFirstLoad.current = false
          setCurrentChatMsgListLoading(false)
          done()
        }
      })
    },
    [currentMessageInfo]
  )

  useEffect(() => {
    currentChatMsgListLoadAll.current = false
    if (!currentMessageInfo) {
      return
    }
    queryCurrentMessageList(currentMessageInfo.id)
  }, [currentMessageInfo])

  const openChatMessageCard = useCallback((messageInfo: OpenChatMessageCardInfo) => {
    // debugger
    if (
      messageInfo.type !== 'apps' &&
      messageInfo.type !== 'groups' &&
      messageInfo.type !== 'users'
    ) {
      console.error('暂不支持的聊天类型')
      return
    }

    if (messageInfoMap.current[messageInfo.info.id]) {
      const currentMessageInfo = messageInfoMap.current[messageInfo.info.id]
      setCurrentMessageInfo((currentMsg) => {
        if (currentMsg?.id === currentMessageInfo.id) {
          return currentMsg
        }
        settingCurrentMessageInfo(currentMessageInfo)
        return { ...currentMessageInfo }
      })
      return
    }

    const msgInfo: MessageInfo = {
      ...messageInfo.info,
      type: messageInfo.type,
      _id: 'message_info_' + messageInfo.info.id
    } as MessageInfo

    putMessageInfoAndSettingCurrent(msgInfo)
    restMessageInfo()
  }, [])

  const closeChatMessageCard = useCallback(
    (msg: MessageInfo) => {
      if (!messageInfoList || messageInfoList.length === 0) {
        return
      }
      const tmpMessageInfoList = [...messageInfoList]
      for (let i = 0; i < tmpMessageInfoList.length; i++) {
        const info = tmpMessageInfoList[i]
        if (info.id === msg.id) {
          if (!info._id) {
            console.error('缺失数据标识, 无法删除数据')
            return
          }
          tmpMessageInfoList.splice(i, 1)
          deleteMessageDataById(info._id)
          if (tmpMessageInfoList.length === 0) {
            settingCurrentMessageInfo(undefined)
          } else if (tmpMessageInfoList.length > i) {
            settingCurrentMessageInfo(tmpMessageInfoList[i])
          } else {
            settingCurrentMessageInfo(tmpMessageInfoList[i - 1])
          }
          restMessageInfo()
          return
        }
      }
    },
    [restMessageInfo, messageInfoList]
  )

  const convertCurrentMessageInfo = useCallback(
    (msgInfo: MessageInfo) => {
      if (!msgInfo || !messageInfoList || messageInfoList.length === 0) {
        return
      }

      for (const info of messageInfoList) {
        if (msgInfo.id === info.id) {
          setCurrentChatMessageList([])
          settingCurrentMessageInfo(info)
          setCurrentMessageInfo(info)
          currentChatMsgListFirstLoad.current = true
          return
        }
      }
    },
    [messageInfoList]
  )

  return {
    messageInfoList,
    currentMessageInfo,
    currentChatMessageList,
    currentChatMsgListLoading,
    convertCurrentMessageInfo,
    openChatMessageCard,
    closeChatMessageCard,
    retryQueryCurrentMessageList: queryCurrentMessageList
  }
}
//#endregion
