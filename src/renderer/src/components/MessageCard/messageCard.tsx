import { FC, useCallback, useMemo } from 'react'
import Avatar from '../Avatar'
import './index.scss'
import { MessageInfo } from '@renderer/pages/Home/components/ContentComments/CommentsSidebar'
import { UserInfo } from '@byzk/teamwork-sdk'
import dayjs from 'dayjs'
import classNames from 'classnames'

export interface MessageCardProps {
  info: MessageInfo
  active?: boolean
  onClick?(info: MessageInfo): void
}

export const MessageCard: FC<MessageCardProps> = ({ info, active, onClick }) => {
  const name = useMemo(() => {
    if (info.type === 'users') {
      const orgNameList: string[] = []
      const userInfo = info.sourceData as UserInfo
      if (userInfo.orgList && userInfo.orgList.length > 0) {
        userInfo.orgList.forEach((org) => orgNameList.push(org.org.name))
      }

      if (orgNameList.length === 0) {
        return userInfo.name
      }

      return `${userInfo.name}( ${orgNameList.join(',')} )`
    } else if (info.type === 'apps') {
      return info.name + '( 应用 )'
    } else if (info.type === 'groups') {
      return info.name + '( 群组 )'
    } else {
      return info.name
    }
  }, [info.name, info.sourceData, info.type])

  const endMegTime = useMemo(() => {
    if (!info.endMessageTime) {
      return
    }

    const time = dayjs(info.endMessageTime)
    const nowTime = dayjs()
    if (nowTime.year() !== time.year()) {
      return time.format('YYYY-MM-DD')
    }

    if (nowTime.month() !== time.month() || nowTime.day() !== time.day()) {
      return time.format('MM-DD')
    }

    return time.format('HH::mm::ss')
  }, [info.endMessageTime])

  const cardClick = useCallback(() => {
    onClick && onClick(info)
  }, [info])

  return (
    <div
      onClick={cardClick}
      className={classNames('message-card', { active })}
      title={info.endMessage}
    >
      <div className="avatar">
        <Avatar
          iconUrl={info.icon}
          status={info.type === 'users' ? 'online' : undefined}
          size="48px"
          name={info.name}
        />
      </div>
      <div className="content">
        <div className="name">
          <div className="recommend" title={name}>
            <span>{name}</span>
          </div>
          <div className="end-message-time">{endMegTime}</div>
        </div>
        <div className="end-msg">
          <span>{info.endMessage}</span>
        </div>
      </div>
    </div>
  )
}

export default MessageCard
