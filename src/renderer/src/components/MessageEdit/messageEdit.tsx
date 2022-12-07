import React, {
  ReactNode,
  useCallback,
  useRef,
  useMemo,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction
} from 'react'
import IMInput, { IIMRef } from '@shen9401/react-im-input'
import './index.scss'
import { Button } from 'tdesign-react'
import { AppInfo, UserInfo } from '@byzk/teamwork-sdk'
import { ChatGroupInfo } from '@byzk/teamwork-inside-sdk'
import { EMsgItem, IEmojiItem } from '@shen9401/react-im-input/type/interface'

const SESSION_STORAGE_MESSAGE_DATA_KEY = 'once-messageEdit-content'

export interface MessageEditInterface {
  insertEmoji(item: IEmojiItem): void
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MessageEditProps {
  minHeight?: number | string
  maxHeight?: number | string
  actionEleList?: ReactNode[]
  currentChatObj: {
    type: 'users' | 'groups' | 'apps'
    meta: UserInfo | ChatGroupInfo | AppInfo
  }
  onSend?(
    currentChatObj: {
      type: 'users' | 'groups' | 'apps'
      meta: UserInfo | ChatGroupInfo | AppInfo
    },
    msgList: EMsgItem[]
  ): void
  children?: ReactNode
}

const _messageEdit: ForwardRefRenderFunction<MessageEditInterface, MessageEditProps> = (
  { actionEleList, minHeight = 98, maxHeight = '100%', currentChatObj, onSend, children },
  ref
) => {
  const imInputRef = useRef<IIMRef>(null)
  const [senderDisabled, setSenderDisabled] = useState<boolean>(true)

  const _onSend = useCallback((msg: EMsgItem[]) => {
    onSend && onSend(currentChatObj, msg)
    imInputRef.current?.setInnerHTML('')
  }, [])

  const inputId = useMemo(() => {
    return (
      SESSION_STORAGE_MESSAGE_DATA_KEY + '_' + currentChatObj.type + '_' + currentChatObj.meta.id
    )
  }, [currentChatObj])

  const actions = useMemo(() => {
    return React.Children.map(actionEleList, (child) => {
      return <div className="action">{child}</div>
    })
  }, [])

  useEffect(() => {
    const messageInput = document.querySelector<HTMLDivElement>(
      '.message-edit .react-im-input > .react-im-input__container'
    )
    if (!messageInput) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const onValueChange = () => {
      if (imInputRef.current?.getInnerHTML()) {
        setSenderDisabled(false)
      } else {
        setSenderDisabled(true)
      }
    }

    messageInput.addEventListener('input', onValueChange)
    return () => {
      return messageInput.removeEventListener('input', onValueChange)
    }
  }, [])

  const senderClick = useCallback(() => {
    imInputRef.current?.sendMsg()
  }, [])

  useImperativeHandle(ref, () => ({
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    insertEmoji: (item) => {
      imInputRef.current?.insertEmoji(item)
    }
  }))

  return (
    <div className="message-edit" style={{ minHeight, maxHeight }}>
      {children}
      <div className="actions">
        <div className="actions-wrapper">{actions}</div>
      </div>
      <div className="content">
        <IMInput inputId={inputId} memberList={[]} handleSend={_onSend} onRef={imInputRef} />
      </div>
      <div className="sender">
        <div className="desc">Enter&nbsp;&nbsp;发送,&nbsp;&nbsp;Shift+Enter&nbsp;&nbsp;换行</div>
        <Button theme="primary" onClick={senderClick} disabled={senderDisabled}>
          发送
        </Button>
      </div>
    </div>
  )
}

export const MessageEdit = forwardRef(_messageEdit)

export default MessageEdit
