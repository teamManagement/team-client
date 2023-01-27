import MessageCard from '@renderer/components/MessageCard'
import { FC, useCallback, useContext, useMemo } from 'react'
import { Actions } from './Actions'
import { Search } from './Search'
import { SearchResult } from '@renderer/components/SearchInput/searchInput'
import { HomeContext } from '@renderer/pages/Home'
import { DataSourceMeta } from '@renderer/pages/Home/hooks'

// const currentMessageCardDbKey = 'current_message_card'

export const CommentsSidebar: FC = () => {
  const homeContext = useContext(HomeContext)
  const { messageOperation } = homeContext

  // const [searchParams] = useSearchParams()

  // const queryCurrentMessage = useCallback((messageList: MessageInfo[]) => {
  //   try {
  //     if (!messageList || messageList.length <= 0) {
  //       return undefined
  //     }
  //     const currentMsg = insideDb.sync.get<MessageInfo>(currentMessageCardDbKey)
  //     if (!currentMsg) {
  //       return undefined
  //     }
  //     if (messageList.findIndex((v) => v.id === currentMsg.id) < 0) {
  //       return undefined
  //     }
  //     return currentMsg
  //   } catch (e) {
  //     return undefined
  //   }
  // }, [])

  // const queryMessageDataList = useCallback(() => {
  //   try {
  //     const messageList = insideDb.sync.index.find<MessageInfo>({
  //       selector: { 'indexInfo.dataType': ' 56userMessage', 'indexInfo.updateAt': { $gte: null } },
  //       sort: [{ 'indexInfo.updateAt': 'desc' }]
  //     }).docs
  //     // console.log('messageList=>', messageList)
  //     return messageList
  //   } catch (e) {
  //     console.log(e)
  //     return []
  //   }
  // }, [])

  // const [messageDataList, setMessageDataList] = useState<MessageInfo[]>(queryMessageDataList())
  // const [currentMessage, setCurrentMessage] = useState<MessageInfo | undefined>(
  //   queryCurrentMessage(messageDataList)
  // )

  // const [appList, setAppList] = useState<AppInfo[]>([])
  // const [userList, setUserList] = useState<UserInfo[]>([])

  // const filterMessageDataList = useCallback((messageIdList: { id: string; _id?: string }[]) => {
  //   const msgIdList = messageIdList.map((m) => m.id)
  //   setMessageDataList((l) => {
  //     let isUpdate = false
  //     for (let i = l.length - 1; i >= 0; i--) {
  //       const _msg = l[i]
  //       if (msgIdList.includes(_msg.id)) {
  //         continue
  //       }

  //       isUpdate = true
  //       msgIdList.splice(i, 1)
  //       // insideDb.sync.remove(_msg._id || _msg.id)
  //     }
  //     if (isUpdate) {
  //       return [...l]
  //     }
  //     return l
  //   })
  // }, [])

  // const queryAppList = useCallback(async () => {
  //   try {
  //     const appList =
  //       (await api.proxyHttpLocalServer<AppInfo[]>('services/resources/app/list', {
  //         timeout: -1
  //       })) || []
  //     setAppList(appList)
  //     filterMessageDataList(appList)
  //   } catch (e) {
  //     setTimeout(queryAppList, 5000)
  //   }
  // }, [])

  // const queryUserList = useCallback(async () => {
  //   try {
  //     const userList = await remoteCache.userList()
  //     setUserList(userList)
  //     // filterMessageDataList(userList)
  //   } catch (e) {
  //     setTimeout(queryUserList, 5000)
  //   }
  // }, [])

  // useEffect(() => {
  //   // queryMessageDataList()
  //   // queryCurrentMessage()
  //   queryAppList()
  //   queryUserList()
  // }, [queryAppList])

  const onSearchResultItemClick = useCallback(
    (r: SearchResult<DataSourceMeta>) => {
      messageOperation.openChatMessageCard({
        type: r.typeId,
        info: {
          id: r.id,
          name: r.metaData?.sourceName || r.name,
          desc: r.desc,
          icon: r.icon,
          sourceData: r.metaData
        }
      })
      // setMessageDataList((messageList) => {
      //   for (const messageInfo of messageList) {
      //     if (r.id === messageInfo.id) {
      //       setCurrentMessage(messageInfo)
      //       return messageDataList
      //     }
      //   }
      //   if (!r.metaData) {
      //     return messageDataList
      //   }
      //   const msg: MessageInfo = {
      //     id: r.id,
      //     name: r.metaData.sourceName || r.name,
      //     desc: r.desc,
      //     icon: r.icon,
      //     type: r.typeId as any,
      //     sourceData: r.metaData.sourceData,
      //     indexInfo: {
      //       dataType: 'userMessage',
      //       updateAt: new Date()
      //     },
      //     _id: (r as any)._id,
      //     _rev: (r as any)._rev
      //   } as any
      //   try {
      //     msg._id = msg._id || msg.id
      //     const res = insideDb.sync.put(msg)
      //     msg._id = res.id
      //     msg._rev = res.rev
      //   } catch (e) {
      //     console.error('更新缓存数据失败: ', JSON.stringify(e))
      //   }
      //   messageDataList.unshift(msg)
      //   setCurrentMessage(msg)
      //   return [...messageDataList]
      // })
    },
    [messageOperation.openChatMessageCard]
  )

  // useEffect(() => {
  //   const userId = searchParams.get('_u')
  //   if (!userId || !userList || userList.length === 0) {
  //     return
  //   }
  //   const index = userList.findIndex((v) => v.id === userId)
  //   if (index === -1) {
  //     return
  //   }

  //   let desc = ''
  //   const userInfo = userList[index]
  //   if (userInfo.orgList) {
  //     for (const o of userInfo.orgList) {
  //       desc += o.org.name + ','
  //     }
  //   }

  //   if (desc.length > 0) {
  //     desc = desc.substring(0, desc.length - 1)
  //     desc = '部门: ' + desc
  //   }
  //   onSearchResultItemClick({
  //     id: userInfo.id,
  //     name: `${userInfo.name}( ${userInfo.username} )`,
  //     typeId: 'users',
  //     icon: userInfo.icon,
  //     iconName: userInfo.name,
  //     desc,
  //     metaData: {
  //       type: 'users',
  //       sourceName: userInfo.name,
  //       sourceData: userInfo
  //     } as any
  //   })

  //   searchParams.set('_u', '')
  // }, [userList, searchParams])

  // const messageClick = useCallback((info: MessageInfo) => {}, [])

  const messageItemElements = useMemo(() => {
    if (messageOperation.messageInfoList.length <= 0) {
      return (
        <div
          style={{
            width: '100%',
            fontSize: 16,
            textAlign: 'center',
            marginTop: 18,
            fontWeight: 'bolder'
          }}
        >
          暂无联系人
        </div>
      )
    }
    console.log(messageOperation.currentMessageInfo)
    return messageOperation.messageInfoList.map((m) => {
      return (
        <div key={m.id} className="item">
          <MessageCard
            onClose={messageOperation.closeChatMessageCard}
            onClick={messageOperation.convertCurrentMessageInfo}
            info={m}
            active={
              messageOperation.currentMessageInfo && m.id === messageOperation.currentMessageInfo.id
            }
          />
        </div>
      )
    })
  }, [
    messageOperation.messageInfoList,
    messageOperation.currentMessageInfo,
    messageOperation.convertCurrentMessageInfo
  ])

  // useEffect(() => {
  //   try {
  //     insideDb.sync.remove(currentMessageCardDbKey)
  //   } catch (e) {
  //     //nothing
  //   }

  //   activeMessageCardChange && activeMessageCardChange(currentMessage)
  //   if (!currentMessage) {
  //     return
  //   }

  //   insideDb.sync.put({
  //     ...currentMessage,
  //     indexInfo: undefined,
  //     _id: currentMessageCardDbKey,
  //     _rev: undefined
  //   })
  // }, [currentMessage])

  return (
    <div className="comments-sidebar">
      <Search onSearchResultItemClick={onSearchResultItemClick} />
      <Actions />
      <div className="contact-list">
        {/* <div style={{ width: 272, height: 38, marginBottom: 18 }}>{messageItemElements}</div> */}
        <div style={{ height: 38, marginBottom: 18 }}>{messageItemElements}</div>
      </div>
    </div>
  )
}
