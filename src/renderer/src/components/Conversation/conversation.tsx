import { ChatGroupInfo } from '@teamworktoolbox/inside-sdk'
import { AppInfo, UserInfo } from '@teamworktoolbox/sdk'
import { ChatMsgType } from '@renderer/pages/Home/hooks'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { FC, useMemo, HtmlHTMLAttributes, ReactNode, CSSProperties } from 'react'
import { ErrorCircleFilledIcon, LoadingIcon } from 'tdesign-icons-react'
import Avatar from '../Avatar'
import { emojiMap, emojiReplaceReg } from '../Emoji'
import { BubbleTipIcon } from './bubbleTipIcon'
import './index.scss'

function replaceEmojiStr(subStr: string): string {
  const emojiImg = emojiMap[subStr]
  if (emojiImg) {
    return `<img class="emoji" src="${emojiImg}" alt="${subStr}" style="vertical-align:-6px; display: inline-block; width: 25px; height: 25px;" />`
  } else {
    return subStr
  }
}

export interface ConversationProps extends HtmlHTMLAttributes<HTMLDivElement> {
  status?: 'loading' | 'error' | 'ok'
  width?: number
  targetInfo?: { type: 'users' | 'groups' | 'apps'; meta: UserInfo | ChatGroupInfo | AppInfo }
  meInfo?: UserInfo
  content: string
  contentType?: ChatMsgType
  sendTime?: string | number
}

export const Conversation: FC<ConversationProps> = ({
  meInfo,
  targetInfo,
  status = 'ok',
  width,
  content,
  contentType,
  sendTime,
  ...otherDatas
}) => {
  const align = useMemo(() => {
    return meInfo ? 'right' : 'left'
  }, [])
  const avatarEle = useMemo(() => {
    let icon: string | undefined = undefined
    let name: string | undefined = undefined
    if (meInfo) {
      icon = meInfo.icon
      name = meInfo.name
    } else if (targetInfo) {
      icon = targetInfo.meta.icon
      name = targetInfo.meta.name
    }
    return <Avatar size="48px" iconUrl={icon} name={name} />
  }, [targetInfo, meInfo])

  const messageTitleDesc = useMemo(() => {
    const msgTitleFlagClassName = 'message-title-flag-' + align
    let ele: ReactNode = undefined
    switch (status) {
      case 'loading':
        ele = <LoadingIcon size="18px" className={msgTitleFlagClassName} />
        break
      case 'error':
        ele = (
          <ErrorCircleFilledIcon
            style={{ cursor: 'pointer' }}
            color="red"
            size="22px"
            className={msgTitleFlagClassName}
          />
        )
    }

    // let desc: string | undefined = undefined
    // if (meInfo) {
    //   desc = `${meInfo.name}( ${meInfo.username} )`
    //   const orgList = meInfo.orgList
    //   if (orgList && orgList.length > 0) {
    //     const orgNameList = orgList.map((org) => org.org.name)
    //     desc += `( 部门: ${orgNameList.join(',')} )`
    //   }
    // } else if (targetInfo) {
    //   desc = targetInfo.meta.name
    //   if (targetInfo.type === 'users') {
    //     const targetUserInfo = targetInfo.meta as UserInfo
    //     if (targetUserInfo.orgList && targetUserInfo.orgList.length > 0) {
    //       desc += `( 部门: ${targetUserInfo.orgList.map((org) => org.org.name).join(',')} )`
    //     } else {
    //       desc += `( ${targetUserInfo.username} )`
    //     }
    //   } else if (targetInfo.type === 'apps') {
    //     desc += '( 应用 )'
    //   } else if (targetInfo.type === 'groups') {
    //     desc += '( 群组 )'
    //   }
    // }

    let desc = ''
    if (sendTime) {
      desc = dayjs(sendTime).format('YYYY-MM-DD HH:mm:ss')
    }

    return (
      <>
        {align === 'right' && ele}
        {desc}
        {align === 'left' && ele}
      </>
    )
  }, [align, status, meInfo, targetInfo, sendTime])

  const contentWidth = useMemo(() => {
    if (!width) {
      return
    }
    return width - 128
  }, [width])

  const msgContent: [
    string | undefined,
    (
      | {
          __html: string
        }
      | undefined
    )
  ] = useMemo(() => {
    if (contentType === ChatMsgType.ChatMsgTypeText) {
      return [undefined, { __html: content.replace(emojiReplaceReg, replaceEmojiStr) }]
    }
    return ['', undefined]
  }, [])

  const contentStyle = useMemo<CSSProperties>(() => {
    if (contentType !== ChatMsgType.ChatMsgTypeText) {
      return {}
    }

    return {
      textAlign: 'left',
      fontSize: 14
    }
  }, [])

  return (
    <div {...otherDatas} style={{ width, ...otherDatas.style }} className="conversation">
      {align == 'left' && <div className="avatar-wrapper">{avatarEle}</div>}
      <div className={classNames('message', align)}>
        <div className="message-title">
          <span>{messageTitleDesc}</span>
        </div>

        <div className="bubble">
          <div className="bubble-tip">
            <BubbleTipIcon width={40} height={28} color="#bcd7f1" />
          </div>
          <div
            className="bubble-content"
            style={{
              maxWidth: contentWidth,
              ...contentStyle
            }}
            dangerouslySetInnerHTML={msgContent[1]}
          >
            {msgContent[0]}
          </div>
        </div>
      </div>
      {align == 'right' && <div className="avatar-wrapper">{avatarEle}</div>}
    </div>
  )
}

export default Conversation
