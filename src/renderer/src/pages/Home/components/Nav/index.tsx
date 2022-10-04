import Avatar from '@renderer/components/Avatar'
import { FC } from 'react'
import { Badge } from 'tdesign-react'
import './index.scss'
import defaultIcon from '../../../../assets/imgs/default-header.png'
import NavItem from '../NavItem'
import IconFont from '@renderer/components/IconFont'

export const Nav: FC = () => {
  return (
    <div className="nav">
      <div className="my-avatar">
        <Badge className="status online" showZero dot offset={[42, 8]}>
          <Badge className="status-background" dot showZero offset={[42, 8]}>
            <Avatar iconUrl={defaultIcon} size="48px" name="苏林鑫" />
          </Badge>
        </Badge>
      </div>
      <NavItem to="comments" style={{ marginTop: 28 }} title="消息列表">
        <IconFont name="comment-dots" />
      </NavItem>
      <NavItem to="contact" title="通讯录">
        <IconFont name="contact" />
      </NavItem>
      <NavItem to="cloudDisk" title="云盘">
        <IconFont name="yunyingpan" />
      </NavItem>
      <NavItem to="applicationCenter" title="应用中心">
        <IconFont name="yingyong" />
      </NavItem>
    </div>
  )
}

export default Nav
