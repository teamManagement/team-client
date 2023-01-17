import { FC, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { current } from '@byzk/teamwork-sdk'
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
      ...messageOperation.currentSendingChatMessageList,
      ...messageOperation.currentChatMessageList
    ]

    return msgList
      .filter((m) => m.chatType >= ChatType.ChatTypeUser && m.chatType <= ChatType.ChatTypeApp)
      .map((m, index) => {
        // console.log(m)
        const key = m.id || m.clientUniqueId || index
        if (m.chatType === ChatType.ChatTypeUser || m.chatType === ChatType.ChatTypeApp) {
          if (m.targetId === current.userInfo.id) {
            return (
              <Conversation
                key={key}
                contentType={m.msgType}
                content={m.content}
                targetInfo={{
                  type: messageOperation.currentMessageInfo!.type,
                  meta: messageOperation.currentMessageInfo!.sourceData.metadata
                }}
                width={commentsContentSize}
                status={m.status}
                sendTime={typeof m.timestamp === 'string' ? parseInt(m.timestamp) : undefined}
              />
            )
          }
          return (
            <Conversation
              key={key}
              contentType={m.msgType}
              content={m.content}
              meInfo={current.userInfo}
              width={commentsContentSize}
              status={m.status}
              sendTime={m.createdAt}
            />
          )
        }

        return undefined
      })
  }, [
    messageOperation.currentSendingChatMessageList,
    messageOperation.currentChatMessageList,
    messageOperation.currentMessageInfo,
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
