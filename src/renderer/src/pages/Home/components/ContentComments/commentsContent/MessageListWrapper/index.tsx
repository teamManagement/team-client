import { FC, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { contextmenu, ContextMenu, current } from '@teamworktoolbox/sdk'
import Conversation from '@renderer/components/Conversation'
import { getCommentsSidebarEle, getNavEle } from '@renderer/dom'
import { useContentWidthSize } from '@renderer/hooks/size'
import { HomeContext, HomeContextType } from '@renderer/pages/Home'
import { ChatType } from '@renderer/pages/Home/hooks'
import { LoadingIcon } from 'tdesign-icons-react'
import { useMutationObserver } from 'ahooks'
import AsyncLock from 'async-lock'

const _lock = new AsyncLock()

export const MessageListWrapper: FC = () => {
  const homeContext = useContext<HomeContextType>(HomeContext)
  const { messageOperation } = homeContext

  const deleteChatMsgId = useRef<string | undefined>(undefined)

  const contextMenu = useRef<ContextMenu | null>(null)
  useEffect(() => {
    const menuId = 'chatMsg-list-contextmenu'
    contextMenu.current = contextmenu.build(
      [
        {
          label: '删除',
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          click() {
            if (!deleteChatMsgId.current) {
              return
            }
            messageOperation.deleteChatMsg(deleteChatMsgId.current)
            deleteChatMsgId.current = undefined
          }
        }
      ],
      menuId
    )
    return () => {
      contextmenu.clear(menuId)
      contextMenu.current = null
    }
  }, [messageOperation.deleteChatMsg])

  const showContextMenu = useCallback((id: string, status: 'loading' | 'error' | 'ok') => {
    if (status !== 'error') {
      return
    }
    deleteChatMsgId.current = id
    contextMenu.current?.popup()
  }, [])

  const wrapperWheelLoading = useRef<boolean>(false)

  const firstScrollToBottom = useRef<boolean>(false)

  const messageListWrapper = useRef<HTMLDivElement>(null)

  const messageWrapperScrollToBottom: () => void = useCallback(() => {
    if (!messageListWrapper.current) {
      return
    }
    messageListWrapper.current.scrollTo({
      top: messageListWrapper.current.scrollHeight,
      behavior: 'smooth'
    })
  }, [])

  useEffect(() => {
    homeContext.dispatch({ type: 'messageListScrollToBottom', data: messageWrapperScrollToBottom })
    return () => {
      homeContext.dispatch({ type: 'messageListScrollToBottom', data: undefined })
    }
  }, [messageWrapperScrollToBottom, homeContext.dispatch])

  const messageListContentWrapper = useRef<HTMLDivElement>(null)

  const mutationObserverHandler = useCallback(() => {
    if (firstScrollToBottom.current) {
      return
    }
    firstScrollToBottom.current = true
    // TODO 因元素内容在第二次加载的时候会非空的元素加载两次，
    // 导致无法区分消息列表是空的还是有东西, 导致滚动到底部失效,
    // 当前所掌握的基本误解，加个定时器，后边如果解决了在换过去
    setTimeout(() => {
      messageWrapperScrollToBottom()
    }, 50)
  }, [])

  useMutationObserver(mutationObserverHandler, messageListContentWrapper, { childList: true })

  useEffect(() => {
    // if (!messageOperation.currentMessageInfo) {
    //   return
    // }
    // messageWrapperScrollToBottom()
    firstScrollToBottom.current = false
  }, [messageOperation.currentMessageInfo])

  const commentsContentSize = useContentWidthSize(() => {
    const navEle = getNavEle()
    const commentsSidebarEle = getCommentsSidebarEle()
    if (!navEle || !commentsSidebarEle) {
      return
    }
    return navEle.clientWidth + commentsSidebarEle.clientWidth + 36
  })

  const conversationList = useMemo(() => {
    // console.log('size => ', messageListWrapperSize)
    // console.log('scrollTop =>', messageListWrapper.current?.scrollTop)
    if (!messageOperation.currentMessageInfo) {
      return
    }

    const msgList = [
      ...messageOperation.currentChatMessageList,
      ...messageOperation.currentSendingChatMessageList
    ]

    const tempIdMap: { [key: string]: boolean } = {}

    return msgList
      .filter((m) => m.chatType >= ChatType.ChatTypeUser && m.chatType <= ChatType.ChatTypeApp)
      .map((m) => {
        if (tempIdMap[m.clientUniqueId]) {
          return undefined
        }

        tempIdMap[m.clientUniqueId] = true
        // console.log(m)
        const key = m.clientUniqueId
        if (m.chatType === ChatType.ChatTypeUser || m.chatType === ChatType.ChatTypeApp) {
          // const deleteMessage: (id: string, info?: ConversationTargetInfo) => void = () => {
          //   homeContext.deleteChatMsg(m)
          // }
          if (m.targetId === current.userInfo.id) {
            return (
              <Conversation
                onErrorRetry={messageOperation.retrySendErrCharMsg}
                onRightClick={showContextMenu}
                id={m.clientUniqueId}
                key={key}
                contentType={m.msgType}
                content={m.content}
                targetInfo={{
                  type: messageOperation.currentMessageInfo!.type,
                  meta: messageOperation.currentMessageInfo!.sourceData.metadata
                }}
                width={commentsContentSize}
                status={m.status}
                errMsg={m.errMsg}
                sendTime={typeof m.timeStamp === 'string' ? parseInt(m.timeStamp) : undefined}
              />
            )
          }
          return (
            <Conversation
              onErrorRetry={messageOperation.retrySendErrCharMsg}
              onRightClick={showContextMenu}
              id={m.clientUniqueId}
              key={key}
              contentType={m.msgType}
              content={m.content}
              meInfo={current.userInfo}
              width={commentsContentSize}
              status={m.status}
              sendTime={m.createdAt}
              errMsg={m.errMsg}
            />
          )
        }

        return undefined
      })
  }, [
    messageOperation.currentSendingChatMessageList,
    messageOperation.currentChatMessageList,
    messageOperation.currentMessageInfo,
    messageOperation.retrySendErrCharMsg,
    commentsContentSize
  ])

  useEffect(() => {
    const ele = messageListWrapper.current
    if (!ele) {
      return
    }
    const onMouseWheel: (event: any) => void = async (event: any) => {
      event.stopPropagation()
      const { deltaY } = event
      const scrollTop = ele.scrollTop + deltaY

      if (messageOperation.currentChatMsgListLoading) {
        event.preventDefault()
        return
      }

      if (!messageOperation.currentMessageInfo || wrapperWheelLoading.current) {
        return
      }

      const down = event.wheelDelta ? event.wheelDelta < 0 : event.detail > 0
      if (down) {
        return
      }

      _lock.acquire('load_chat_message', async (done) => {
        try {
          if (!messageOperation.currentMessageInfo || wrapperWheelLoading.current) {
            return
          }
          if (scrollTop < 500) {
            event.preventDefault()

            wrapperWheelLoading.current = true
            await messageOperation.retryQueryCurrentMessageList(
              messageOperation.currentMessageInfo.id
            )
            setTimeout(() => {
              wrapperWheelLoading.current = false
            }, 1000)
          }
        } finally {
          done()
        }
      })
    }
    ele.addEventListener('mousewheel', onMouseWheel)

    return () => {
      wrapperWheelLoading.current = false
      ele.removeEventListener('mousewheel', onMouseWheel)
    }
  }, [messageOperation.currentMessageInfo, messageOperation.currentChatMsgListLoading])

  return (
    <div className="message-list" ref={messageListWrapper}>
      {messageOperation.currentChatMsgListLoading && (
        <div className="message-loading">
          <LoadingIcon size={16} />
        </div>
      )}
      <div className="wrapper" ref={messageListContentWrapper}>
        {conversationList}
      </div>
    </div>
  )
}
