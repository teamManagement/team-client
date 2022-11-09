import { FC } from 'react'
import { ContentBreadcrumb } from '../ContentBreadcrumb'
import { ContentTitle } from '../ContentTitle'
// import './index.scss'

export const OrgContact: FC = () => {
  return (
    <div className="contact-wrapper">
      <ContentTitle title="组织架构" />
      <ContentBreadcrumb />
      <div className="contact-wrapper-content">
        <div className="item"></div>
      </div>
    </div>
  )
}
