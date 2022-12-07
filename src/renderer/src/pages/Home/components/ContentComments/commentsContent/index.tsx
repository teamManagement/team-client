import { api, ChatGroupInfo } from '@byzk/teamwork-inside-sdk'
import { AppInfo, UserInfo } from '@byzk/teamwork-sdk'
import { ImgEmoji } from '@renderer/assets/actionImg/emoji'
import { ImgUploadFile } from '@renderer/assets/actionImg/uploadFile'
import { ImgUploadPicture } from '@renderer/assets/actionImg/uploadPicture'
import ChatTitle from '@renderer/components/ChatTitle'
import MessageEdit, { MessageEditInterface } from '@renderer/components/MessageEdit'
import { Emoji } from '@renderer/components/Emoji'
import { useUserinfo } from '@renderer/hooks'
import { EMsgItem, IEmojiItem } from '@shen9401/react-im-input/type/interface'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AsyncLock from 'async-lock'
import localforage from 'localforage'
import { MessageInfo } from '../CommentsSidebar'
import { MessageListWrapper } from './MessageListWrapper'
import { ChatMsgType, ChatType, UserChatMsg } from './vos'

const lock = new AsyncLock()

function createId(): Promise<string> {
  return api.proxyHttpLocalServer('/services/id/create')
}

export interface CommentsContentProps {
  currentMessageCard?: MessageInfo
}

export const CommentsContent: FC<CommentsContentProps> = ({ currentMessageCard }) => {
  const currentChatTypeRef = useRef<ChatType | undefined>(undefined)
  const currentTargetInfo = useRef<UserInfo | ChatGroupInfo | AppInfo | undefined>(undefined)
  const messageEditRef = useRef<MessageEditInterface>(null)
  const loadingPutChatMsg = useRef<UserChatMsg[]>([])
  const currentUser = useUserinfo()
  const [showEmoji, setShowEmoji] = useState<boolean>(false)
  const [currentChatMsgListMap, setCurrentChatMsgListMap] = useState<{
    [key: string]: UserChatMsg[]
  }>({})
  const [currentChatMsgListLoading, setCurrentChatMsgListLoading] = useState<boolean>(true)

  useEffect(() => {
    setCurrentChatMsgListLoading(true)
    if (!currentMessageCard || !currentUser) {
      // setCurrentChatMsgList([])
      currentTargetInfo.current = undefined
      return
    }
    currentTargetInfo.current = currentMessageCard.sourceData
    console.log(currentMessageCard)
    const storageChatListKey =
      currentUser?.id + '_' + currentMessageCard.sourceData.id + '_chat_list'
    const storageChatFlagKey =
      currentUser?.id + '_' + currentMessageCard.sourceData.id + '_chat_flag'
    lock.acquire(storageChatListKey, (done) => {
      localforage.getItem<UserChatMsg[]>(storageChatListKey, async (err, val) => {
        try {
          if (err) {
            return
          }
          setCurrentChatMsgListMap((m) => {
            m[currentMessageCard.id] = val || []
            return { ...m }
          })

          const jsonData: any = {
            targetId: currentMessageCard.id
          }

          if (val && val.length > 0) {
            const endTimeId = await localforage.getItem(storageChatFlagKey)
            if (endTimeId) {
              jsonData.clientTimeId = val[val.length - 1].clientUniqueId
            }
          }
          const chatList = await api.proxyHttpLocalServer<UserChatMsg[]>(
            '/services/chat/msg/query',
            {
              timeout: -1,
              jsonData
            }
          )

          let endTimeId: string = jsonData.endTimeId
          if (chatList && chatList.length > 0) {
            endTimeId = chatList[0].clientUniqueId
          }

          await localforage.setItem(storageChatListKey, chatList)
          if (endTimeId) {
            await localforage.setItem(storageChatFlagKey, endTimeId)
          }
          if (currentTargetInfo.current && currentMessageCard.id === currentTargetInfo.current.id) {
            setCurrentChatMsgListMap((m) => {
              const list = m[currentMessageCard.id] || []
              if (chatList && chatList.length > 0) {
                list.push(...chatList)
              }

              m[currentMessageCard.id] = [...list]

              localforage.setItem(storageChatListKey, list)
              setTimeout(done, 100)
              return { ...m }
            })
          }
        } finally {
          setCurrentChatMsgListLoading(false)
        }
      })
    })
  }, [currentMessageCard, currentUser])

  // useEffect(() => {
  //   if (!currentMessageCard || !currentUser) {
  //     return
  //   }
  //   const sessionKey = currentUser?.id + '_' + currentMessageCard.sourceData.id + '_chat_list'
  //   lock.acquire('chatMsgPutLock', (done) => {
  //     localforage.setItem(sessionKey, currentChatMsgList, () => {
  //       done()
  //     })
  //   })
  // }, [currentChatMsgList])

  useEffect(() => {
    if (!currentMessageCard) {
      currentChatTypeRef.current = undefined
      return
    }

    if (currentMessageCard.type === 'users') {
      currentChatTypeRef.current = ChatType.ChatTypeUser
    } else if (currentMessageCard.type === 'apps') {
      currentChatTypeRef.current = ChatType.ChatTypeApp
    } else if (currentMessageCard.type === 'groups') {
      currentChatTypeRef.current = ChatType.ChatTypeGroup
    } else {
      currentChatTypeRef.current = undefined
    }
  }, [currentMessageCard])

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
      />,
      <ImgUploadPicture title="图片" key={'uploadPicture'} />,
      <ImgUploadFile title="文件" key={'uploadFile'} />
    ]
  }, [])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const _clickFn = () => {
      setShowEmoji(false)
    }
    document.addEventListener('click', _clickFn)
    return () => {
      document.removeEventListener('click', _clickFn)
    }
  }, [])

  const msgOnSend = useCallback(
    async (
      currentObj: {
        type: 'users' | 'groups' | 'apps'
        meta: UserInfo | ChatGroupInfo | AppInfo
      },
      msgList: EMsgItem[]
    ) => {
      const localChatMsgList: UserChatMsg[] = []
      for (const msg of msgList) {
        const localChatMsgInfo: UserChatMsg = {
          targetId: currentObj.meta.id
        } as UserChatMsg

        switch (msg.type) {
          case 'TEXT':
            localChatMsgInfo.msgType = ChatMsgType.ChatMsgTypeText
            localChatMsgInfo.content = msg.data as string
        }

        try {
          localChatMsgInfo.clientUniqueId = await createId()
          if (!currentChatTypeRef.current) {
            localChatMsgInfo.errMsg = '缺失消息类型'
            localChatMsgInfo.status = 'error'
          }
          localChatMsgInfo.status = 'loading'
        } catch (e) {
          localChatMsgInfo.errMsg = ''
          localChatMsgInfo.status = 'error'
        }

        localChatMsgInfo.chatType = currentChatTypeRef.current!

        loadingPutChatMsg.current.push(localChatMsgInfo)
        localChatMsgList.push(localChatMsgInfo)
      }

      setCurrentChatMsgListMap((m) => {
        const l = m[currentObj.meta.id]
        m[currentObj.meta.id] = [...l, ...localChatMsgList]
        return { ...m }
      })
      // setCurrentChatMsgList((l) => [...l, ...localChatMsgList])
    },
    [currentUser]
  )

  useEffect(() => {
    lock.acquire('chatMsgPutLock', async (done) => {
      try {
        const len = loadingPutChatMsg.current.length
        if (len === 0) {
          return
        }

        for (let i = len - 1; i >= 0; i--) {
          let loadingChatMsg = loadingPutChatMsg.current[i]
          loadingPutChatMsg.current.splice(i, 1)
          if (loadingChatMsg.status !== 'loading') {
            continue
          }

          try {
            loadingChatMsg = await api.proxyHttpLocalServer<UserChatMsg>('/services/chat/msg/put', {
              timeout: -1,
              jsonData: { ...loadingChatMsg, status: undefined } as UserChatMsg
            })
          } catch (e) {
            loadingChatMsg.status = 'error'
            loadingChatMsg.errMsg = (e as any).message || e
          }
          setCurrentChatMsgListMap((m) => {
            const l = m[loadingChatMsg.targetId] || []
            for (let i = l.length - 1; i >= 0; i--) {
              if (l[i].clientUniqueId === loadingChatMsg.clientUniqueId) {
                l[i] = loadingChatMsg
                break
              }
            }
            m[loadingChatMsg.targetId] = [...l]
            return { ...m }
          })
        }
      } finally {
        done()
      }
    })
  }, [currentChatMsgListMap])

  const emojiItemClick = useCallback((item: IEmojiItem) => {
    messageEditRef.current?.insertEmoji(item)
  }, [])

  return (
    <>
      {currentMessageCard && currentUser ? (
        <div className="comments-content">
          <ChatTitle messageInfo={currentMessageCard}>
            {/* <UserIcon size="22px" />
        <SettingIcon size="22px" /> */}
          </ChatTitle>
          <MessageListWrapper
            messageList={currentChatMsgListMap[currentMessageCard.id] || []}
            currentMessageCard={currentMessageCard}
            currentUser={currentUser}
            loading={currentChatMsgListLoading}
          />
          <div className="message-edit">
            <MessageEdit
              ref={messageEditRef}
              onSend={msgOnSend}
              currentChatObj={{
                type: currentMessageCard.type,
                meta: currentMessageCard.sourceData
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
