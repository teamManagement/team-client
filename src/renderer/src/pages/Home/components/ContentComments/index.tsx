import { FC } from 'react'
import './index.scss'
import { CommentsSidebar } from './CommentsSidebar'
import { CommentsContent } from './commentsContent'

export const ContentComments: FC = () => {
  return (
    <div className="comments match-parent">
      <CommentsSidebar />
      <CommentsContent />
    </div>
  )
}

export default ContentComments
