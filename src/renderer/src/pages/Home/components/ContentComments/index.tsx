import { FC } from 'react'
import './index.scss'
import { CommentsSidebar } from './CommentsSidebar'
import { CommentsContent } from './commentsContent'

export const ContentComments: FC = () => {
  // const [currentMessageCard, setCurrentMessageCard] = useState<MessageInfo | undefined>(undefined)
  // const onMessageCardChange = useCallback((msg: MessageInfo) => {
  //   setCurrentMessageCard(msg)
  // }, [])
  return (
    <div className="comments match-parent">
      <CommentsSidebar />
      <CommentsContent />
    </div>
  )
}

export default ContentComments
