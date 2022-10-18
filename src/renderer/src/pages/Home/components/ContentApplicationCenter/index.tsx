import { FC } from 'react'
import { Button, Input } from 'tdesign-react'
import { Tabs } from 'antd'
import { AddIcon, SearchIcon, AppIcon, FormatHorizontalAlignCenterIcon } from 'tdesign-icons-react'
import 'antd/dist/antd.css'
import './index.scss'
import { AppDesktop } from './appDesktop'

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
          style={{ height: '100%', paddingTop: 8 }}
          tabPosition="left"
          tabBarExtraContent={{
            right: (
              <Button variant="text" icon={<AddIcon />}>
                添加分类
              </Button>
            )
          }}
          items={[
            {
              label: (
                <span className="app-item">
                  <AppIcon />
                  <span>全部</span>
                </span>
              ),
              key: 'all',
              children: <AppDesktop showContextMenu />
            }, // 务必填写 key
            {
              label: (
                <span className="app-item">
                  <FormatHorizontalAlignCenterIcon />
                  <span>正在使用</span>
                </span>
              ),
              key: 'item-2',
              children: '内容 1'
            } // 务必填写 key
          ]}
        />
      </div>
    </div>
  )
}

export default ContentApplicationCenter
