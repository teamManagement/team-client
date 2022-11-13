import { ImgEmoji } from '@renderer/assets/actionImg/emoji'
import { ImgUploadFile } from '@renderer/assets/actionImg/uploadFile'
import { ImgUploadPicture } from '@renderer/assets/actionImg/uploadPicture'
import ChatTitle from '@renderer/components/ChatTitle'
import Conversation from '@renderer/components/Conversation'
import MessageEdit from '@renderer/components/MessageEdit'
import { FC, useMemo } from 'react'

export const CommentsContent: FC = () => {
  const actionEleList = useMemo(() => {
    return [
      <ImgEmoji title="表情" key={'emoji'} />,
      <ImgUploadPicture title="图片" key={'uploadPicture'} />,
      <ImgUploadFile title="文件" key={'uploadFile'} />
    ]
  }, [])
  return (
    <div className="comments-content">
      <ChatTitle>
        {/* <UserIcon size="22px" />
        <SettingIcon size="22px" /> */}
      </ChatTitle>
      <div className="message-list">
        <div className="wrapper">
          <Conversation />
          <Conversation align="right" />
          <Conversation />
          <Conversation />
          <Conversation />
          <Conversation />
          <Conversation />
          <Conversation />
          <Conversation />
          <Conversation />
          <Conversation />
          <Conversation />
        </div>
      </div>

      <div className="message-edit">
        <MessageEdit actionEleList={actionEleList} minHeight={'100%'} />
      </div>
    </div>
  )
}
