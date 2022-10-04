import { FC, useMemo } from 'react'
import { Select, Button } from 'tdesign-react'
import { AddIcon, SettingIcon, UserIcon } from 'tdesign-icons-react'
import SearchInput from '@renderer/components/SearchInput'
import './index.scss'
import MessageCard from '@renderer/components/MessageCard'
import ChatTitle from '@renderer/components/ChatTitle'
import Conversation from '@renderer/components/Conversation'
import MessageEdit from '@renderer/components/MessageEdit'
import { ImgEmoji } from '@renderer/assets/actionImg/emoji'
import { ImgUploadPicture } from '@renderer/assets/actionImg/uploadPicture'
import { ImgUploadFile } from '@renderer/assets/actionImg/uploadFile'

export const ContentComments: FC = () => {
  const actionEleList = useMemo(() => {
    return [
      <ImgEmoji title="表情" key={'emoji'} />,
      <ImgUploadPicture title="图片" key={'uploadPicture'} />,
      <ImgUploadFile title="文件" key={'uploadFile'} />
    ]
  }, [])

  return (
    <div className="comments match-parent">
      <div className="comments-sidebar">
        <div className="search">
          <SearchInput style={{ height: 48 }} />
        </div>
        <div className="actions">
          <div className="label">列表排序：</div>
          <div className="action-select">
            <Select
              size="small"
              value={'1'}
              bordered={false}
              options={[
                {
                  label: '最新消息优先',
                  value: '1'
                },
                {
                  label: '在线好友优先',
                  value: '2'
                }
              ]}
            ></Select>
          </div>
          <div className="label" style={{ paddingLeft: 28 }}>
            创建会话
          </div>
          <div>
            <Button size="medium" shape="circle" icon={<AddIcon size="18px" />} theme="primary" />
          </div>
        </div>
        <div className="contact-list">
          <div style={{ width: 272, height: 38, marginBottom: 18 }}>
            <MessageCard />
          </div>
        </div>
      </div>
      <div className="comments-content">
        <ChatTitle>
          <UserIcon size="22px" />
          <SettingIcon size="22px" />
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
    </div>
  )
}

export default ContentComments
