import { ChatGroupInfo } from '@teamworktoolbox/inside-sdk'
import { AppInfo, UserInfo } from '@teamworktoolbox/sdk'
import { ChatMsgType } from '@renderer/pages/Home/hooks'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { FC, useMemo, HtmlHTMLAttributes, CSSProperties } from 'react'
import { ErrorCircleFilledIcon, LoadingIcon } from 'tdesign-icons-react'
import Avatar from '../Avatar'
import { emojiMap, emojiReplaceReg } from '../Emoji'
import { BubbleTipIcon } from './bubbleTipIcon'
import './index.scss'
import { useCallback } from 'react'

function replaceEmojiStr(subStr: string): string {
  const emojiImg = emojiMap[subStr]
  if (emojiImg) {
    return `<img class="emoji" src="${emojiImg}" alt="${subStr}" style="vertical-align:-6px; display: inline-block; width: 25px; height: 25px;" />`
  } else {
    return subStr
  }
}

export interface ConversationTargetInfo {
  type: 'users' | 'groups' | 'apps'
  meta: UserInfo | ChatGroupInfo | AppInfo
}

export interface ConversationProps extends HtmlHTMLAttributes<HTMLDivElement> {
  id: string
  status?: 'loading' | 'error' | 'ok'
  errMsg?: string
  width?: number
  targetInfo?: ConversationTargetInfo
  meInfo?: UserInfo
  content: string
  contentType?: ChatMsgType
  sendTime?: string | number
  onErrorRetry?(id: string, info?: ConversationTargetInfo): void
  onRightClick?(id: string, status?: 'loading' | 'error' | 'ok'): void
}

export const Conversation: FC<ConversationProps> = ({
  id,
  meInfo,
  targetInfo,
  status = 'ok',
  errMsg,
  width,
  content,
  contentType,
  sendTime,
  onErrorRetry,
  onRightClick,
  ...otherDatas
}) => {
  // const contextMenu = useRef<ContextMenu | null>()

  // const clearContextmenu = useCallback((key: string) => {
  //   contextmenu.clear(key)
  //   contextMenu.current = null
  // }, [])

  // useEffect(() => {
  //   const contextmenuId = 'conversation-error-menu-' + targetInfo?.type + '-' + id

  //   if (status !== 'error') {
  //     clearContextmenu(contextmenuId)
  //     return
  //   }

  //   console.log('被调用')
  //   // if (contextMenu.current !== null) {
  //   //   return
  //   // }

  //   contextMenu.current = contextmenu.build(
  //     [
  //       {
  //         label: '删除',
  //         // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  //         click() {
  //           onDeleteClick && onDeleteClick(id, targetInfo)
  //         }
  //       }
  //     ],
  //     contextmenuId
  //   )

  //   return () => {
  //     console.log('取消调用')
  //     clearContextmenu(contextmenuId)
  //   }
  // }, [id, status, targetInfo])

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
    // const msgTitleFlagClassName = 'message-title-flag-' + align
    // let ele: ReactNode = undefined
    // switch (status) {
    //   // case 'loading':
    //   //   ele = <LoadingIcon size="18px" className={msgTitleFlagClassName} />
    //   //   break
    //   case 'error':
    //     ele = (
    //       <ErrorCircleFilledIcon
    //         style={{ cursor: 'pointer' }}
    //         color="red"
    //         size="22px"
    //         className={msgTitleFlagClassName}
    //       />
    //     )
    // }

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
        {/* {align === 'right' && ele} */}
        {desc}
        {/* {align === 'left' && ele} */}
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

  const errorClick = useCallback(() => {
    onErrorRetry && onErrorRetry(id, targetInfo)
  }, [onErrorRetry, targetInfo, id])

  const onContextMenu = useCallback(() => {
    onRightClick && onRightClick(id, status)
  }, [onRightClick, id, status])

  return (
    <div
      onContextMenu={onContextMenu}
      {...otherDatas}
      style={{ width, ...otherDatas.style }}
      className="conversation"
    >
      {align == 'left' && <div className="avatar-wrapper">{avatarEle}</div>}
      <div className={classNames('message', align)}>
        <div className="message-title">
          <span>{messageTitleDesc}</span>
        </div>

        <div className="bubble">
          {status === 'loading' && (
            <LoadingIcon style={{ color: '#999' }} className="status" size="18px" />
          )}
          {status === 'error' && (
            <span className="status" title={errMsg}>
              <ErrorCircleFilledIcon
                onClick={errorClick}
                style={{ cursor: 'pointer' }}
                color="red"
                size="22px"
              />
            </span>
          )}
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
