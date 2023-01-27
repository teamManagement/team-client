import { ImgEmoji } from '@renderer/assets/actionImg/emoji'
import ChatTitle from '@renderer/components/ChatTitle'
import MessageEdit, { MessageEditInterface } from '@renderer/components/MessageEdit'
import { Emoji } from '@renderer/components/Emoji'
import { useUserinfo } from '@renderer/hooks'
import { IEmojiItem } from '../../../../../components/ImInput/interface'
import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { MessageListWrapper } from './MessageListWrapper'
import { HomeContext, HomeContextType } from '@renderer/pages/Home'

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
