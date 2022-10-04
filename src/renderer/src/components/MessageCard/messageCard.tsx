import { FC } from 'react'
import { RepliedIcon } from './repliedIcon'
import Avatar from '../Avatar'
import './index.scss'

export const MessageCard: FC = () => {
  return (
    <div className="message-card active">
      <div className="avatar">
        <Avatar status="online" size="48px" name="苏林鑫" />
      </div>
      <div className="name">苏林鑫</div>
      <div className="status">在线</div>
      <div className="time">2022年9月20日</div>
      <div className="message">
        <div className="replied-icon">
          <RepliedIcon />
        </div>
        <p className="text-content">
          这是超长的测试文本这是超长的测试文本这是超长的测试文本这是超长的测试文本这是超长的测试文本这是超长的测试文本
        </p>
        <div className="unread-badge">
          <span className="badge-count">99+</span>
        </div>
      </div>
    </div>
  )
}

export default MessageCard
