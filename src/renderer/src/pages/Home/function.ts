import { insideDb } from '@byzk/teamwork-inside-sdk'
import { current } from '@byzk/teamwork-sdk'
import { ChatType, UserChatMsg } from './components/ContentComments/commentsContent/vos'

const _unreadMsgDbKey = 'unread_msg'
const _unreadMsgNumDbKey = 'unread_msg_num'

export function addUnreadMsg(msg: UserChatMsg): void {
  const currentUserInfo = current.userInfo
  switch (msg.chatType) {
    case ChatType.ChatTypeUser:
      if (msg.targetId !== currentUserInfo.id) {
        return
      }
      //   insideDb.insideDb.sync.put()
      return
    case ChatType.ChatTypeGroup:
      console.warn('暂不支持的消息类型')
      return
    case ChatType.ChatTypeApp:
      console.warn('暂不支持的消息类型')
      return
    default:
      console.log('未被识别的消息类型')
      return
  }
}
