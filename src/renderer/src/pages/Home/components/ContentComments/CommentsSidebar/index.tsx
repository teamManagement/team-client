import MessageCard from '@renderer/components/MessageCard'
import SearchInput from '@renderer/components/SearchInput'
import { FC } from 'react'
import { AddIcon } from 'tdesign-icons-react'
import { Button, Select } from 'tdesign-react'

export const CommentsSidebar: FC = () => {
  return (
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
  )
}
