import Avatar from '@renderer/components/Avatar'
import { FC, useEffect, useState } from 'react'
import { MessagePlugin } from 'tdesign-react'
import './index.scss'
import NavItem from '../NavItem'
import IconFont from '@renderer/components/IconFont'
import { UserInfo } from '@renderer/vos/user'
import { useUserStatus } from '@renderer/hooks'

export const Nav: FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined)
  const userStatus = useUserStatus()
  useEffect(() => {
    window.proxyApi
      .httpLocalServerProxy<UserInfo>('/user/now')
      .then((user) => {
        console.log('获取到的用户信息: ', user)
        setUserInfo(user)
      })
      .catch((e) => {
        MessagePlugin.error('获取用户信息失败: ' + ((e as any).message || e))
      })
  }, [])
  return (
    <div className="nav">
      <div className="my-avatar">
        {userInfo && (
          <Avatar status={userStatus} iconUrl={userInfo.icon} size="48px" name={userInfo.name} />
        )}
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
