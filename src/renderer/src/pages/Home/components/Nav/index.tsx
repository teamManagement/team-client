import Avatar from '@renderer/components/Avatar'
import { FC, useEffect, useState, MouseEvent } from 'react'
import './index.scss'
import NavItem from '../NavItem'
import IconFont from '@renderer/components/IconFont'
import { useUserinfo, useUserStatus } from '@renderer/hooks'
import { useCallback } from 'react'
import { api, modalWindow } from '@byzk/teamwork-inside-sdk'

export const Nav: FC = () => {
  const userInfo = useUserinfo()
  const userStatus = useUserStatus()
  const [showAvatarOperation, setAvatarOperation] = useState<boolean>(false)

  const avatarClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setAvatarOperation((show) => !show)
  }, [])

  useEffect(() => {
    if (!showAvatarOperation) {
      return
    }

    const fn: () => void = () => {
      setAvatarOperation(false)
    }
    document.addEventListener('click', fn)
    return () => {
      document.removeEventListener('click', fn)
    }
  }, [showAvatarOperation])

  const logout = useCallback(() => {
    api.logout()
  }, [])

  return (
    <div className="nav">
      <div className="my-avatar">
        {userInfo && (
          <Avatar
            onClick={avatarClick}
            status={userStatus}
            iconUrl={userInfo.icon}
            size="48px"
            name={userInfo.name}
          />
        )}
        {userInfo && showAvatarOperation && (
          <div className="user-avatar-operation">
            <div className="user-avatar-operation-title">
              <Avatar iconUrl={userInfo.icon} size="38px" name={userInfo.name} />
              <div
                title={`${userInfo.username}( ${userInfo.name} )`}
                className="user-avatar-operation-title-username"
              >
                <span>{`${userInfo.username}( ${userInfo.name} )`}</span>
              </div>
            </div>
            <div className="user-avatar-operation-desc">
              <div onClick={modalWindow.showUserinfo} className="operation-item">
                <div className="name">我的信息</div>
              </div>
              {/* TODO 这版本不做 */}
              {/* <div className="operation-item">
                <div className="name">帐号设置</div>
              </div> */}
              <div onClick={logout} className="operation-item">
                <div className="name">退出登录</div>
              </div>
            </div>
          </div>
        )}
      </div>
      <NavItem to="comments" style={{ marginTop: 28 }} title="消息列表">
        <IconFont name="comment-dots" />
      </NavItem>
      <NavItem to="contact" title="通讯录">
        <IconFont name="contact" />
      </NavItem>
      {/* TODO 本版本暂缓开发 */}
      {/* <NavItem to="cloudDisk" title="云盘">
        <IconFont name="yunyingpan" />
      </NavItem> */}
      <NavItem to="applicationCenter" title="应用中心">
        <IconFont name="yingyong" />
      </NavItem>
    </div>
  )
}

export default Nav
