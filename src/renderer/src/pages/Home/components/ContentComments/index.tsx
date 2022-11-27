import { FC, useCallback, useState } from 'react'
import './index.scss'
import { CommentsSidebar, MessageInfo } from './CommentsSidebar'
import { CommentsContent } from './commentsContent'

export const ContentComments: FC = () => {
  const [currentMessageCard, setCurrentMessageCard] = useState<MessageInfo | undefined>(undefined)
  const onMessageCardChange = useCallback((msg: MessageInfo) => {
    setCurrentMessageCard(msg)
  }, [])
  return (
    <div className="comments match-parent">
      <CommentsSidebar activeMessageCardChange={onMessageCardChange} />
      <CommentsContent currentMessageCard={currentMessageCard} />
    </div>
  )
}

export default ContentComments
