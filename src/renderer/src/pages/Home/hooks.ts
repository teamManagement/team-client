import { useCallback, useEffect, useRef, useState } from 'react'
import localforage from 'localforage'
import AsyncLock from 'async-lock'
import { api, ChatGroupInfo, remoteCache } from '@teamworktoolbox/inside-sdk'
import { AppInfo, current, encoding, UserInfo } from '@teamworktoolbox/sdk'
import { SearchResult } from '@renderer/components/SearchInput/searchInput'
import {
  confirmSendingChatMsgInfo,
  convertMessageInfoListToMessageInfoMap,
  deleteChatMsg,
  deleteMessageDataById,
  errorSendingToLoading,
  getMessageInfoById,
  getSendingUserChatMsg,
  MessageInfo,
  MessageInfoMap,
  putMessageInfo,
  queryCurrentMessageInfo,
  queryMessageDataList,
  querySendingChatMsgInfoList,
  saveSendingChatMsgInfo,
  searchResultFilter,
  sendingMsgHaveError,
  settingCurrentMessageInfo
} from './function'
import { EMsgItem, EMsgType } from '@renderer/components/ImInput/interface'
import dayjs from 'dayjs'
import { message } from 'tdesign-react'
import { QueueMsgInfo, QueueMsgType } from './vos'

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
function getChatMsgLocalForageKey(targetId: string): string {
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
   * 时间戳
   */
  timeStamp: string
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
   * 当前发送中的消息
   */
  currentSendingChatMessageList: UserChatMsg[]
  /**
   * 当前消息列表是否正在加载
   */
  currentChatMsgListLoading: boolean
  /**
   * 删除消息
   * @param info 要删除的消息
   */
  deleteChatMsg(chatMsgId: string): void
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
  /**
   * 发送消息
   * @param currentChatObj 发送到的对象
   * @param msgItemList 要发送的消息列表
   */
  sendMsg(
    currentChatObj: {
      type: 'users' | 'groups' | 'apps'
      meta: UserInfo | ChatGroupInfo | AppInfo
    },
    msgItemList: EMsgItem[]
  ): Promise<void>
  retrySendErrCharMsg(id: string): void
}

interface RetrySendMsgInfo {
  timeoutId: any
  userChatMsgClientUniqueId: string
}

/**
 *
 * @returns 消息
 */
export function useChatMessageOperation(fns?: {
  scrollToBottom?: () => void
}): ChatMessageCardHookReturnType {
  const sendingRetryMsgTimeoutIdMap = useRef<{
    [key: string]: RetrySendMsgInfo
  }>({})
  const currentChatMsgListLoadAll = useRef<boolean>(false)
  const currentChatMsgListFirstLoad = useRef<boolean>(true)
  const [currentChatMsgListLoading, setCurrentChatMsgListLoading] = useState<boolean>(false)

  const [messageInfoList, setMessageInfoList] = useState<MessageInfo[]>([])

  const messageInfoMap = useRef<MessageInfoMap>({})

  const [currentMessageInfo, setCurrentMessageInfo] = useState<MessageInfo | undefined>(undefined)

  const [currentChatMessageList, setCurrentChatMessageList] = useState<UserChatMsg[]>([])
  const [currentSendingChatMessageList, setCurrentSendingChatMessageList] = useState<UserChatMsg[]>(
    []
  )

  const loadCurrentSendingMessageList = useCallback(async () => {
    _lock.acquire('loadingSendingMessageList', async (done) => {
      try {
        if (!currentMessageInfo) {
          setCurrentSendingChatMessageList([])
          return
        }

        let chatType: ChatType
        switch (currentMessageInfo.type) {
          case 'apps':
            chatType = ChatType.ChatTypeApp
            break
          case 'groups':
            chatType = ChatType.ChatTypeGroup
            break
          case 'users':
            chatType = ChatType.ChatTypeUser
            break
          default:
            return
        }

        // TODO 现将整个流程弄玩之后再考虑容错问题
        const sendingMsgList = await querySendingChatMsgInfoList(chatType, currentMessageInfo.id)
        for (const k in sendingMsgList) {
          startRetrySendMsg(sendingMsgList[k].clientUniqueId)
        }
        setCurrentSendingChatMessageList(sendingMsgList)
      } finally {
        done()
      }
    })
  }, [currentMessageInfo])

  const sendOutMsgHandler = useCallback(async (userChatMsg: UserChatMsg) => {
    let targetId = ''
    let messageInfo: OpenChatMessageCardInfo | undefined = undefined

    if (userChatMsg.chatType === ChatType.ChatTypeUser) {
      if (
        (userChatMsg.targetId === current.userInfo.id &&
          userChatMsg.sourceId === current.userInfo.id) ||
        (userChatMsg.targetId !== current.userInfo.id &&
          userChatMsg.sourceId !== current.userInfo.id)
      ) {
        return
      }

      if (userChatMsg.targetId === current.userInfo.id) {
        targetId = userChatMsg.sourceId
      } else {
        targetId = userChatMsg.targetId
      }

      if (await getMessageInfoById(targetId)) {
        return
      }

      const userList = await remoteCache.userList()
      for (const user of userList) {
        if (user.id === targetId) {
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
          messageInfo = {
            type: 'users',
            info: { id: user.id, name: user.name, icon: user.icon, sourceData: user, desc }
          }
          break
        }
      }
    }

    if (!targetId || !messageInfo) {
      return
    }

    openChatMessageCard(messageInfo, true)
  }, [])

  const confirmSendingMsg = useCallback(
    (userChatMsg: UserChatMsg, isSendOut?: boolean) => {
      console.log(currentMessageInfo)
      const { targetId } = userChatMsg
      const localforageKey = getChatMsgLocalForageKey(targetId)
      _lock.acquire(localforageKey, async (done) => {
        try {
          try {
            await _lock.acquire('retry_send_chat_msg', (done) => {
              const retryInfo = sendingRetryMsgTimeoutIdMap.current[userChatMsg.clientUniqueId]
              if (retryInfo && retryInfo.timeoutId) {
                clearTimeout(retryInfo.timeoutId)
              }
              delete sendingRetryMsgTimeoutIdMap.current[userChatMsg.clientUniqueId]
              try {
                confirmSendingChatMsgInfo(userChatMsg)
              } catch (e) {
                if (!isSendOut) {
                  done(e as any)
                  return
                }
                //nothing
              }
              done()
            })
          } catch (e) {
            return
          }
          if (!isSendOut) {
            loadCurrentSendingMessageList()
          }

          if (isSendOut) {
            await sendOutMsgHandler(userChatMsg)
          }

          if (currentMessageInfo?.id !== targetId) {
            return
          }
          const userChatMsgList: UserChatMsg[] = JSON.parse(
            (await localforage.getItem(localforageKey)) || '[]'
          )

          let localRequestUrl = `/services/chat/msg/query/end/${targetId}`
          if (userChatMsgList.length > 0) {
            const endChatMsg = userChatMsgList[userChatMsgList.length - 1]
            localRequestUrl = `/services/chat/msg/query/news/${targetId}/${endChatMsg.id}`
          }

          const newsUserChatMsgList: UserChatMsg[] = await api.proxyHttpLocalServer(
            localRequestUrl,
            {
              timeout: -1
            }
          )

          userChatMsgList.push(...newsUserChatMsgList)
          setCurrentChatMessageList(userChatMsgList)
          await localforage.setItem(localforageKey, JSON.stringify(userChatMsgList))
          fnsRef.current.scrollToBottom()
        } finally {
          done()
        }
      })
    },
    [currentMessageInfo, loadCurrentSendingMessageList]
  )

  useEffect(() => {
    const fnId = api.registerServerMsgHandler<QueueMsgInfo>((data) => {
      if (data.cmdCode !== 5 || !data.data.content) {
        return
      }

      if (data.data.type === QueueMsgType.CONFIRM || data.data.type === QueueMsgType.SEND_OUT) {
        const userChatMsg = JSON.parse(encoding.sync.base64Decode(data.data.content))
        confirmSendingMsg(userChatMsg, data.data.type === QueueMsgType.SEND_OUT)
        return
      }
    })
    return () => {
      api.removeServerMsgHandler(fnId)
    }
  }, [confirmSendingMsg])

  const fnsRef = useRef<{
    scrollToBottom: () => void
  }>({
    scrollToBottom() {
      //nothing
    }
  })

  useEffect(() => {
    fnsRef.current = {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      scrollToBottom() {
        setTimeout(() => {
          fns?.scrollToBottom?.()
        }, 50)
      }
    }
  }, [fns?.scrollToBottom])

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

      const localforageKey = getChatMsgLocalForageKey(targetId)

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
              localChatMsgList = []
              await localforage.setItem(localforageKey, JSON.stringify(localChatMsgList))
            } else {
              localRequestUrl += `&&end=${localChatMsgList[0].timeStamp}&&reverse=1`
            }
          }

          try {
            const response: UserChatMsg[] = await api.proxyHttpLocalServer(localRequestUrl, {
              timeout: -1
            })
            if (!response || response.length === 0) {
              currentChatMsgListLoadAll.current = true
              if (isFirstLoad) {
                setCurrentChatMessageList([])
              }
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

  const convertCurrentMessageInfo = useCallback(
    (msgInfo?: MessageInfo) => {
      if (!msgInfo) {
        setCurrentChatMessageList([])
        settingCurrentMessageInfo(undefined)
        setCurrentMessageInfo(undefined)
        currentChatMsgListFirstLoad.current = true
        return
      }

      // if (msgInfo.id === currentMessageInfo?.id) {
      //   return
      // }

      if (!messageInfoList || messageInfoList.length === 0) {
        return
      }

      for (const info of messageInfoList) {
        if (msgInfo.id === info.id) {
          setCurrentMessageInfo((currentMsg) => {
            if (msgInfo.id === currentMsg?.id) {
              return currentMsg
            }
            setCurrentChatMessageList([])
            settingCurrentMessageInfo(info)
            currentChatMsgListFirstLoad.current = true
            // fnsRef.current.scrollToBottom()
            return info
          })
          // setCurrentMessageInfo(info)
          return
        }
      }
    },
    [messageInfoList]
  )

  const openChatMessageCard = useCallback(
    (messageInfo: OpenChatMessageCardInfo, noCurrent?: boolean) => {
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

      putMessageInfo(msgInfo, !noCurrent)
      restMessageInfo()
    },
    []
  )

  const closeChatMessageCard = useCallback(
    async (msg: MessageInfo) => {
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
          await deleteMessageDataById(info._id)
          if (tmpMessageInfoList.length === 0) {
            convertCurrentMessageInfo(undefined)
            // settingCurrentMessageInfo(undefined)
          } else if (tmpMessageInfoList.length > i) {
            convertCurrentMessageInfo(tmpMessageInfoList[i])
          } else {
            convertCurrentMessageInfo(tmpMessageInfoList[i - 1])
          }
          restMessageInfo()
          return
        }
      }
    },
    [restMessageInfo, messageInfoList, convertCurrentMessageInfo]
  )

  const startRetrySendMsg = useCallback((userChatMsgClientUniqueId: string) => {
    _lock.acquire('retry_send_chat_msg', (done) => {
      try {
        if (
          !userChatMsgClientUniqueId ||
          sendingRetryMsgTimeoutIdMap.current[userChatMsgClientUniqueId]
        ) {
          return
        }

        sendingRetryMsgTimeoutIdMap.current[userChatMsgClientUniqueId] = {
          timeoutId: setTimeout(() => {
            _lock.acquire('retry_send_chat_msg', async (done) => {
              try {
                const currentRetryMsg =
                  sendingRetryMsgTimeoutIdMap.current[userChatMsgClientUniqueId]
                delete sendingRetryMsgTimeoutIdMap.current[userChatMsgClientUniqueId]
                if (!currentRetryMsg) {
                  return
                }

                const chatMsg = await getSendingUserChatMsg(userChatMsgClientUniqueId)
                if (!chatMsg || chatMsg.status !== 'loading') {
                  return
                }

                console.log('向服务器重新发送消息: ', sendingRetryMsgTimeoutIdMap)
                sendMsgToServer(userChatMsgClientUniqueId)
                startRetrySendMsg(userChatMsgClientUniqueId)
              } finally {
                done()
              }
            })
          }, 30000),
          userChatMsgClientUniqueId
        }
      } finally {
        done()
      }
    })
  }, [])

  useEffect(() => {
    loadCurrentSendingMessageList()
  }, [loadCurrentSendingMessageList])

  const sendMsgToServer = useCallback(
    async (userChatMsgClientUniqueId: string) => {
      if (!userChatMsgClientUniqueId) {
        return
      }

      await _lock.acquire('sending_' + userChatMsgClientUniqueId, async (done) => {
        try {
          const userChatMsg = await getSendingUserChatMsg(userChatMsgClientUniqueId)
          if (!userChatMsg || userChatMsg.status !== 'loading') {
            return
          }
          await api.proxyHttpLocalServer('/services/chat/msg/put', {
            jsonData: userChatMsg,
            timeout: -1
          })
        } catch (e) {
          console.log(e)
          await sendingMsgHaveError(userChatMsgClientUniqueId, (e as Error).message || (e as any))
          loadCurrentSendingMessageList()
        } finally {
          done()
        }
      })
    },
    [loadCurrentSendingMessageList]
  )

  const sendMsg = useCallback(
    async (
      currentChatObj: {
        type: 'users' | 'groups' | 'apps'
        meta: UserInfo | ChatGroupInfo | AppInfo
      },
      msgItemList: EMsgItem[]
    ) => {
      if (!msgItemList || msgItemList.length === 0) {
        return
      }
      let chatType: ChatType
      switch (currentChatObj.type) {
        case 'apps':
          chatType = ChatType.ChatTypeApp
          break
        case 'groups':
          chatType = ChatType.ChatTypeGroup
          break
        case 'users':
          chatType = ChatType.ChatTypeUser
          break
        default:
          console.error('未知的聊天类型')
          return
      }

      for (let i = 0; i < msgItemList.length; i++) {
        const _id = await api.proxyHttpLocalServer<string>('/services/id/create')

        const msgItem = msgItemList[i]

        let nowTime: string
        let msgType: ChatMsgType
        let content: string
        switch (msgItem.type) {
          case EMsgType.text:
            nowTime = dayjs().valueOf().toString()
            msgType = ChatMsgType.ChatMsgTypeText
            content = typeof msgItem.data === 'string' ? msgItem.data : ''
            break
          default:
            console.warn('暂不支持发送的聊天内容类型')
            continue
        }

        const waitSendMsg = {
          targetId: currentChatObj.meta.id,
          targetInfo: currentChatObj.meta,
          sourceId: current.userInfo.id,
          sourceInfo: current.userInfo,
          content,
          chatType,
          msgType,
          timeStamp: nowTime,
          status: 'loading',
          clientUniqueId: _id
        } as UserChatMsg

        saveSendingChatMsgInfo(waitSendMsg)
        sendMsgToServer(waitSendMsg.clientUniqueId)
      }

      loadCurrentSendingMessageList()
      fnsRef.current.scrollToBottom()
    },
    [loadCurrentSendingMessageList]
  )

  const deleteChatMessage = useCallback(
    async (msgId: string) => {
      if (!msgId) {
        return
      }
      try {
        await deleteChatMsg(msgId)
      } catch (e) {
        message.error('删除消息内容失败: ' + ((e as Error).message || e))
        return
      }
      loadCurrentSendingMessageList()
    },
    [loadCurrentSendingMessageList]
  )

  const retrySendErrCharMsg = useCallback(
    async (clientUniqueId: string) => {
      await errorSendingToLoading(clientUniqueId)
      await loadCurrentSendingMessageList()
      setTimeout(async () => {
        console.log('重发错误消息')
        await sendMsgToServer(clientUniqueId)
      }, 5000)
    },
    [loadCurrentSendingMessageList, sendMsgToServer]
  )

  return {
    messageInfoList,
    currentMessageInfo,
    currentChatMessageList,
    currentChatMsgListLoading,
    currentSendingChatMessageList,
    deleteChatMsg: deleteChatMessage,
    convertCurrentMessageInfo,
    openChatMessageCard,
    closeChatMessageCard,
    retryQueryCurrentMessageList: queryCurrentMessageList,
    sendMsg,
    retrySendErrCharMsg
  }
}
//#endregion
