import classNames from 'classnames'
import { FC, useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './index.scss'

export interface SidebarItemProps {
  iconBackgroundColor?: string
  iconUrl?: string
  iconImgSize?: number
  desc?: string
  targetUrl: string
}

export const SidebarItem: FC<SidebarItemProps> = ({
  iconBackgroundColor,
  iconUrl,
  iconImgSize,
  desc,
  targetUrl
}) => {
  const [active, setActive] = useState<boolean>(false)
  const location = useLocation()
  const navigate = useNavigate()
  const navigateToTarget = useCallback(() => {
    navigate(targetUrl, { replace: true })
  }, [targetUrl])

  useEffect(() => {
    setActive(location.pathname === targetUrl)
  }, [location.pathname])

  return (
    <div
      onClick={navigateToTarget}
      className={classNames('content-contact-sidebar-item', { active })}
    >
      <div className="icon-wrapper">
        <div className="icon" style={{ backgroundColor: iconBackgroundColor }}>
          {iconUrl && (
            <img
              style={{ width: iconImgSize || '100%', height: iconImgSize || '100%' }}
              src={iconUrl}
            />
          )}
        </div>
      </div>
      <div className="desc">
        <span>{desc}</span>
      </div>
    </div>
  )
}
