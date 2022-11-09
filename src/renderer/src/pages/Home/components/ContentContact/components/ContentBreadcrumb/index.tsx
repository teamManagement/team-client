import { FC } from 'react'
import { Breadcrumb } from 'antd'
import './index.scss'

export const ContentBreadcrumb: FC = () => {
  return (
    <div className="content-breadcrumb">
      <Breadcrumb separator=">">
        <Breadcrumb.Item>
          <span className="item-content">
            <a>view1</a>
          </span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>view2</Breadcrumb.Item>
        <Breadcrumb.Item>view3</Breadcrumb.Item>
      </Breadcrumb>
    </div>
  )
}
