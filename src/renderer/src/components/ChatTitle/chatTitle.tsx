import { AppInfo, UserInfo } from '@teamworktoolbox/sdk'
import { MessageInfo } from '@renderer/pages/Home/function'
import { CSSProperties, FC, ReactNode, useMemo, Children } from 'react'
import Avatar from '../Avatar'
import './index.scss'

export interface ChatTitleProps {
  style?: CSSProperties
  messageInfo?: MessageInfo
  status: 'online' | 'offline' | undefined
  children?: ReactNode | ReactNode[]
}

export const ChatTitle: FC<ChatTitleProps> = ({ style, children, messageInfo, status }) => {
  const operationGroupEle = useMemo(() => {
    return Children.map(children, (item) => {
      return <div className="action">{item}</div>
    })
  }, [])

  const avatarElement = useMemo(() => {
    if (!messageInfo) {
      return <div></div>
    }

    // let status: 'online' | 'offline' | undefined = undefined
    // if (messageInfo.type === 'users') {
    //   status = 'offline'
    // }

    return <Avatar status={status} size="43px" name={messageInfo.name} />
  }, [messageInfo, status])

  const name = useMemo(() => {
    if (!messageInfo) {
      return ''
    }

    if (messageInfo.type === 'apps') {
      return messageInfo.name + '( 应用 )'
    } else if (messageInfo.type === 'groups') {
      return messageInfo.name + '( 群组 )'
    } else if (messageInfo.type === 'users') {
      return `${messageInfo.name}( ${(messageInfo.sourceData.metadata as UserInfo).username} )`
    } else {
      return messageInfo.name
    }
  }, [messageInfo])

  const desc = useMemo(() => {
    if (!messageInfo) {
      return ''
    }

    if (messageInfo.type === 'users') {
      const userInfo = messageInfo.sourceData.metadata as UserInfo
      const orgName: string[] = []
      const orgList = userInfo.orgList
      if (orgList) {
        for (const orgInfo of orgList) {
          orgName.push(orgInfo.org.name)
        }
      }
      if (orgName.length === 0) {
        return ''
      }

      return `部门: ${orgName.join(',')}`
    }

    if (messageInfo.type === 'apps') {
      return (messageInfo.sourceData.metadata as AppInfo).shortDesc
    }

    return messageInfo.desc
  }, [messageInfo])

  return (
    <div style={style} className="chat-title">
      <div className="avatar">{avatarElement}</div>
      <div className="desc">
        <div className="name">
          <span>{name}</span>
        </div>
        {desc && (
          <div className="name-desc">
            <span>{desc}</span>
          </div>
        )}
      </div>
      <div className="operation-groups">{operationGroupEle}</div>
    </div>
  )
}

export default ChatTitle
