import { FC } from 'react'
import { Button, Input } from 'tdesign-react'
import { Tabs } from 'antd'
import { AddIcon, SearchIcon } from 'tdesign-icons-react'
// import 'antd/lib/tabs/style/index.css'
import 'antd/dist/antd.css'
import './index.scss'

export const ContentApplicationCenter: FC = () => {
  return (
    <div className="application-center match-parent">
      <div className="search">
        <Input
          prefixIcon={<SearchIcon />}
          style={{ width: 280 }}
          placeholder="请输入要搜索的应用名称"
        />
      </div>
      <div className="application-container">
        <Tabs
          style={{ height: '100%' }}
          tabPosition="left"
          tabBarExtraContent={{
            right: (
              <Button variant="text" icon={<AddIcon />}>
                添加分类
              </Button>
            )
          }}
          items={[
            { label: '项目 1', key: 'item-1', children: '内容 1' }, // 务必填写 key
            { label: '项目 1', key: 'item-2', children: '内容 1' }, // 务必填写 key
            { label: '项目 1', key: 'item-3', children: '内容 1' }, // 务必填写 key
            { label: '项目 2', key: 'item-40', children: '内容 2' }
          ]}
        />
      </div>
    </div>
  )
}

export default ContentApplicationCenter
