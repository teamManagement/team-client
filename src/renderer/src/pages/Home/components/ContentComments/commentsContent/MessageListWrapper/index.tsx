import { UserInfo } from '@byzk/teamwork-sdk'
import Conversation from '@renderer/components/Conversation'
import { getCommentsSidebarEle, getNavEle } from '@renderer/dom'
import { useContentWidthSize } from '@renderer/hooks/size'
import { FC, useEffect, useMemo, useRef } from 'react'
import { LoadingIcon } from 'tdesign-icons-react'
import { MessageInfo } from '../../CommentsSidebar'
import { ChatType, UserChatMsg } from '../vos'

export interface MessageListWrapperProps {
  currentMessageCard: MessageInfo
  currentUser: UserInfo
  messageList: UserChatMsg[]
  loading?: boolean
}

export const MessageListWrapper: FC<MessageListWrapperProps> = ({
  currentMessageCard,
  currentUser,
  messageList,
  loading
}) => {
  const prevEndMsgId = useRef<string>('')
  const messageListWrapper = useRef<HTMLDivElement>(null)

  const messageWrapperScrollToBottom: () => void = () => {
    if (!messageListWrapper.current) {
      return
    }
    messageListWrapper.current.scrollTo({
      top: messageListWrapper.current.scrollHeight,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    messageWrapperScrollToBottom()
  }, [currentMessageCard])

  const commentsContentSize = useContentWidthSize(() => {
    const navEle = getNavEle()
    const commentsSidebarEle = getCommentsSidebarEle()
    if (!navEle || !commentsSidebarEle) {
      return
    }
    return navEle.clientWidth + commentsSidebarEle.clientWidth + 36
  })

  const conversationList = useMemo(() => {
    return messageList
      .filter((m) => m.chatType >= ChatType.ChatTypeUser && m.chatType <= ChatType.ChatTypeApp)
      .map((m, index) => {
        console.log(m)
        const key = m.id || m.clientUniqueId || index
        if (m.chatType === ChatType.ChatTypeUser || m.chatType === ChatType.ChatTypeApp) {
          if (m.targetId === currentUser.id) {
            return (
              <Conversation
                key={key}
                contentType={m.msgType}
                content={m.content}
                targetInfo={{ type: currentMessageCard.type, meta: currentMessageCard.sourceData }}
                width={commentsContentSize}
                status={m.status}
                sendTime={m.createdAt}
              />
            )
          }
          return (
            <Conversation
              key={key}
              contentType={m.msgType}
              content={m.content}
              meInfo={currentUser}
              width={commentsContentSize}
              status={m.status}
              sendTime={m.createdAt}
            />
          )
        }

        return undefined
      })
  }, [messageList, currentUser, currentMessageCard, commentsContentSize])

  useEffect(() => {
    if (!conversationList || conversationList.length === 0) {
      prevEndMsgId.current = ''
      return
    }

    const endMsg = messageList[messageList.length - 1]
    const endId = endMsg.id || 'c_' + endMsg.clientUniqueId

    if (prevEndMsgId.current !== endId) {
      prevEndMsgId.current = endId
      messageWrapperScrollToBottom()
      return
    }
  }, [conversationList, messageList])
  return (
    <div className="message-list" ref={messageListWrapper}>
      {loading && (
        <div className="message-loading">
          <LoadingIcon size={16} />
        </div>
      )}
      <div className="wrapper">{conversationList}</div>
    </div>
  )
}
