import React, { ReactNode, useCallback, useRef, useMemo } from 'react'
import IMInput, { IIMRef } from '@shen9401/react-im-input'
import './index.scss'
import { Button } from 'tdesign-react'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MessageEditProps {
  minHeight?: number | string
  maxHeight?: number | string
  actionEleList?: ReactNode[]
}

export const MessageEdit: React.FC<MessageEditProps> = ({
  actionEleList,
  minHeight = 98,
  maxHeight = '100%'
}) => {
  const imInputRef = useRef<IIMRef>(null)
  const onSend = useCallback(() => {}, [])

  const actions = useMemo(() => {
    return React.Children.map(actionEleList, (child) => {
      return <div className="action">{child}</div>
    })
  }, [])

  return (
    <div className="message-edit" style={{ minHeight, maxHeight }}>
      <div className="actions">
        <div className="actions-wrapper">{actions}</div>
      </div>
      <div className="content">
        <IMInput memberList={[]} handleSend={onSend} onRef={imInputRef} />
        <div className="btn">
          <Button theme="success">发送(Enter)</Button>
        </div>
      </div>
    </div>
  )
}

export default MessageEdit
