import { FC } from 'react'
import { Select } from 'tdesign-react'

export const Actions: FC = () => {
  return (
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
      {/* <div className="label" style={{ paddingLeft: 28 }}>
      创建会话
    </div>
    <div>
      <Button size="medium" shape="circle" icon={<AddIcon size="18px" />} theme="primary" />
    </div> */}
    </div>
  )
}
