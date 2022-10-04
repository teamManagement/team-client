import { CSSProperties, FC, ReactNode, useMemo, Children } from 'react'
import Avatar from '../Avatar'
import './index.scss'

export interface ChatTitleProps {
  style?: CSSProperties
  children?: ReactNode | ReactNode[]
}

export const ChatTitle: FC<ChatTitleProps> = ({ style, children }) => {
  const operationGroupEle = useMemo(() => {
    return Children.map(children, (item) => {
      return <div className="action">{item}</div>
    })
  }, [])

  return (
    <div style={style} className="chat-title">
      <div className="avatar">
        <Avatar status="online" size="43px" name="苏林鑫" />
      </div>
      <div className="desc">
        <div className="name">
          <span>苏林鑫( 电子签章业务部 )</span>
        </div>
        <div className="name-desc">
          <span>sdf</span>
        </div>
      </div>
      <div className="operation-groups">{operationGroupEle}</div>
    </div>
  )
}

export default ChatTitle
