import { ImgEmoji } from '@renderer/assets/actionImg/emoji'
// import { ImgUploadFile } from '@renderer/assets/actionImg/uploadFile'
// import { ImgUploadPicture } from '@renderer/assets/actionImg/uploadPicture'
import ChatTitle from '@renderer/components/ChatTitle'
import MessageEdit, { MessageEditInterface } from '@renderer/components/MessageEdit'
import { Emoji } from '@renderer/components/Emoji'
import { useUserinfo } from '@renderer/hooks'
import { IEmojiItem } from '../../../../../components/ImInput/interface'
import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { MessageListWrapper } from './MessageListWrapper'
import { HomeContext, HomeContextType } from '@renderer/pages/Home'

// export interface CommentsContentProps {
//   currentMessageCard?: MessageInfo
// }

export const CommentsContent: FC = () => {
  const homeContext = useContext<HomeContextType>(HomeContext)
  const { currentMessageInfo, sendMsg } = homeContext.messageOperation

  const currentUser = useUserinfo()

  const [currentTargetUserStatus, setCurrentTargetUserStatus] = useState<
    'online' | 'offline' | undefined
  >(undefined)

  // const currentChatTypeRef = useRef<ChatType | undefined>(undefined)
  // const currentTargetInfo = useRef<UserInfo | ChatGroupInfo | AppInfo | undefined>(undefined)
  const messageEditRef = useRef<MessageEditInterface>(null)
  // const loadingPutChatMsg = useRef<UserChatMsg[]>([])
  const [showEmoji, setShowEmoji] = useState<boolean>(false)
  // const [currentChatMsgListMap, setCurrentChatMsgListMap] = useState<{
  //   [key: string]: UserChatMsg[]
  // }>({})
  // const [currentChatMsgListLoading, setCurrentChatMsgListLoading] = useState<boolean>(true)

  // const handlerUnreadChatMsg = useCallback(async () => {
  //   for (;;) {
  //     // console.log(await homeContext.getUnreadChatMsg())
  //     const unreadChatMsg = await homeContext.getUnreadChatMsg()
  //     if (!unreadChatMsg) {
  //       return
  //     }

  //     if (!unreadChatMsg.targetId || !unreadChatMsg.sourceId || !currentUser) {
  //       continue
  //     }

  //     setCurrentChatMsgListMap((m) => {
  //       let chatId: string | undefined | undefined
  //       if (currentUser.id === unreadChatMsg.sourceId) {
  //         chatId = unreadChatMsg.targetId
  //       } else if (currentUser.id === unreadChatMsg.targetId) {
  //         chatId = unreadChatMsg.sourceId
  //       } else {
  //         return m
  //       }

  //       if (!chatId) {
  //         return m
  //       }

  //       const userChatMsgList = m[chatId]
  //       if (!userChatMsgList) {
  //         return m
  //       }

  //       m[chatId] = [...userChatMsgList, unreadChatMsg]

  //       return { ...m }
  //     })
  //     console.log('读取到未读消息: ', unreadChatMsg)
  //   }
  // }, [homeContext.getUnreadChatMsg, currentUser])

  // useEffect(() => {
  //   handlerUnreadChatMsg()
  //   return () => {
  //     homeContext.clearUnreadFn()
  //   }
  // }, [handlerUnreadChatMsg])

  useEffect(() => {
    if (!currentMessageInfo || currentMessageInfo.type !== 'users') {
      setCurrentTargetUserStatus(undefined)
      return
    }

    const status = homeContext.onlineUserIdList.includes(currentMessageInfo.id)
      ? 'online'
      : 'offline'
    setCurrentTargetUserStatus(status)
  }, [currentMessageInfo, homeContext.onlineUserIdList])

  // useEffect(() => {
  //   setCurrentChatMsgListLoading(true)
  //   if (!currentMessageInfo || !currentUser) {
  //     // setCurrentChatMsgList([])
  //     currentTargetInfo.current = undefined
  //     return
  //   }
  //   currentTargetInfo.current = currentMessageInfo.sourceData.metadata
  //   console.log(currentMessageInfo)
  //   const storageChatListKey =
  //     currentUser?.id + '_' + currentMessageInfo.sourceData.metadata.id + '_chat_list'
  //   const storageChatFlagKey =
  //     currentUser?.id + '_' + currentMessageInfo.sourceData.metadata.id + '_chat_flag'
  //   lock.acquire(storageChatListKey, (done) => {
  //     localforage.getItem<UserChatMsg[]>(storageChatListKey, async (err, val) => {
  //       try {
  //         if (err) {
  //           return
  //         }
  //         setCurrentChatMsgListMap((m) => {
  //           m[currentMessageInfo.sourceData.metadata.id] = val || []
  //           return { ...m }
  //         })

  //         const jsonData: any = {
  //           targetId: currentMessageInfo.sourceData.metadata.id
  //         }

  //         if (val && val.length > 0) {
  //           const endTimeId = await localforage.getItem(storageChatFlagKey)
  //           if (endTimeId) {
  //             jsonData.clientTimeId = val[val.length - 1].clientUniqueId
  //           }
  //         }
  //         const chatList = await api.proxyHttpLocalServer<UserChatMsg[]>(
  //           '/services/chat/msg/query',
  //           {
  //             timeout: -1,
  //             jsonData
  //           }
  //         )

  //         let endTimeId: string = jsonData.endTimeId
  //         if (chatList && chatList.length > 0) {
  //           endTimeId = chatList[0].clientUniqueId
  //         }

  //         await localforage.setItem(storageChatListKey, chatList)
  //         if (endTimeId) {
  //           await localforage.setItem(storageChatFlagKey, endTimeId)
  //         }
  //         if (
  //           currentTargetInfo.current &&
  //           currentMessageInfo.sourceData.metadata.id === currentTargetInfo.current.id
  //         ) {
  //           setCurrentChatMsgListMap((m) => {
  //             const list = m[currentMessageInfo.sourceData.metadata.id] || []
  //             if (chatList && chatList.length > 0) {
  //               list.push(...chatList)
  //             }

  //             m[currentMessageInfo.sourceData.metadata.id] = [...list]

  //             localforage.setItem(storageChatListKey, list)
  //             setTimeout(done, 100)
  //             return { ...m }
  //           })
  //         }
  //       } finally {
  //         setCurrentChatMsgListLoading(false)
  //       }
  //     })
  //   })
  // }, [currentMessageInfo, currentUser])

  // // useEffect(() => {
  // //   if (!currentMessageCard || !currentUser) {
  // //     return
  // //   }
  // //   const sessionKey = currentUser?.id + '_' + currentMessageCard.sourceData.id + '_chat_list'
  // //   lock.acquire('chatMsgPutLock', (done) => {
  // //     localforage.setItem(sessionKey, currentChatMsgList, () => {
  // //       done()
  // //     })
  // //   })
  // // }, [currentChatMsgList])

  // useEffect(() => {
  //   if (!currentMessageCard) {
  //     currentChatTypeRef.current = undefined
  //     return
  //   }

  //   if (currentMessageCard.type === 'users') {
  //     currentChatTypeRef.current = ChatType.ChatTypeUser
  //   } else if (currentMessageCard.type === 'apps') {
  //     currentChatTypeRef.current = ChatType.ChatTypeApp
  //   } else if (currentMessageCard.type === 'groups') {
  //     currentChatTypeRef.current = ChatType.ChatTypeGroup
  //   } else {
  //     currentChatTypeRef.current = undefined
  //   }
  // }, [currentMessageCard])

  const actionEleList = useMemo(() => {
    return [
      <ImgEmoji
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setShowEmoji((s) => !s)
        }}
        title="表情"
        key={'emoji'}
      />
      // <ImgUploadPicture title="图片" key={'uploadPicture'} />,
      // <ImgUploadFile title="文件" key={'uploadFile'} />
    ]
  }, [])

  useEffect(() => {
    const _clickFn: () => void = () => {
      setShowEmoji(false)
    }
    document.addEventListener('click', _clickFn)
    return () => {
      document.removeEventListener('click', _clickFn)
    }
  }, [])

  // const msgOnSend = useCallback(
  //   async (
  //     currentObj: {
  //       type: 'users' | 'groups' | 'apps'
  //       meta: UserInfo | ChatGroupInfo | AppInfo
  //     },
  //     msgList: EMsgItem[]
  //   ) => {
  //     const localChatMsgList: UserChatMsg[] = []
  //     for (const msg of msgList) {
  //       const localChatMsgInfo: UserChatMsg = {
  //         targetId: currentObj.meta.id
  //       } as UserChatMsg

  //       switch (msg.type) {
  //         case 'TEXT':
  //           localChatMsgInfo.msgType = ChatMsgType.ChatMsgTypeText
  //           localChatMsgInfo.content = msg.data as string
  //       }

  //       try {
  //         localChatMsgInfo.clientUniqueId = await createId()
  //         if (!currentChatTypeRef.current) {
  //           localChatMsgInfo.errMsg = '缺失消息类型'
  //           localChatMsgInfo.status = 'error'
  //         }
  //         localChatMsgInfo.status = 'loading'
  //       } catch (e) {
  //         localChatMsgInfo.errMsg = ''
  //         localChatMsgInfo.status = 'error'
  //       }

  //       localChatMsgInfo.chatType = currentChatTypeRef.current!

  //       loadingPutChatMsg.current.push(localChatMsgInfo)
  //       localChatMsgList.push(localChatMsgInfo)
  //     }

  //     setCurrentChatMsgListMap((m) => {
  //       const l = m[currentObj.meta.id]
  //       m[currentObj.meta.id] = [...l, ...localChatMsgList]
  //       return { ...m }
  //     })
  //     // setCurrentChatMsgList((l) => [...l, ...localChatMsgList])
  //   },
  //   [currentUser]
  // )

  // useEffect(() => {
  //   lock.acquire('chatMsgPutLock', async (done) => {
  //     try {
  //       const len = loadingPutChatMsg.current.length
  //       if (len === 0) {
  //         return
  //       }

  //       for (let i = len - 1; i >= 0; i--) {
  //         let loadingChatMsg = loadingPutChatMsg.current[i]
  //         loadingPutChatMsg.current.splice(i, 1)
  //         if (loadingChatMsg.status !== 'loading') {
  //           continue
  //         }

  //         try {
  //           loadingChatMsg = await api.proxyHttpLocalServer<UserChatMsg>('/services/chat/msg/put', {
  //             timeout: -1,
  //             jsonData: { ...loadingChatMsg, status: undefined } as UserChatMsg
  //           })
  //         } catch (e) {
  //           loadingChatMsg.status = 'error'
  //           loadingChatMsg.errMsg = (e as any).message || e
  //         }
  //         setCurrentChatMsgListMap((m) => {
  //           const l = m[loadingChatMsg.targetId] || []
  //           for (let i = l.length - 1; i >= 0; i--) {
  //             if (l[i].clientUniqueId === loadingChatMsg.clientUniqueId) {
  //               l[i] = loadingChatMsg
  //               break
  //             }
  //           }
  //           m[loadingChatMsg.targetId] = [...l]
  //           return { ...m }
  //         })
  //       }
  //     } finally {
  //       done()
  //     }
  //   })
  // }, [currentChatMsgListMap])

  const emojiItemClick = useCallback((item: IEmojiItem) => {
    messageEditRef.current?.insertEmoji(item)
  }, [])

  return (
    <>
      {currentMessageInfo && currentUser ? (
        <div className="comments-content">
          <ChatTitle status={currentTargetUserStatus} messageInfo={currentMessageInfo}>
            {/* <UserIcon size="22px" />
        <SettingIcon size="22px" /> */}
          </ChatTitle>
          <MessageListWrapper />
          <div className="message-edit">
            <MessageEdit
              ref={messageEditRef}
              // onSend={msgOnSend}
              onSend={sendMsg}
              currentChatObj={{
                type: currentMessageInfo.type,
                meta: currentMessageInfo.sourceData.metadata
              }}
              actionEleList={actionEleList}
              minHeight={'100%'}
            >
              {showEmoji && (
                <div className="emoji-popup">
                  <div className="wrapper">
                    <Emoji click={emojiItemClick} />
                  </div>
                  <div className="bottom-shadow"></div>
                </div>
              )}
            </MessageEdit>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </>
  )
}
