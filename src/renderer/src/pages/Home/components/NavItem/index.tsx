import { FC, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import classnames from 'classnames'
import './index.scss'

export interface NavItemProps {
  to?: string
  title?: string
  style?: React.CSSProperties
  className?: string
  children?: React.ReactNode
}

export const NavItem: FC<NavItemProps> = ({ style, to, title, className, children }) => {
  const location = useLocation()
  const targetTo = useMemo(() => {
    if (!to) {
      return '/home'
    }

    let target = to
    if (!target.startsWith('/')) {
      target = '/' + target
    }

    if (!target.startsWith('/home')) {
      target = '/home' + target
    }
    return target
  }, [to])
  const targetItemClassName = useMemo(() => {
    return classnames(className, 'nav-item', {
      active: location.pathname === targetTo
    })
  }, [location.pathname])

  return (
    <div style={style} title={title} className={targetItemClassName}>
      <Link className="match-parent" to={targetTo}>
        {children}
      </Link>
    </div>
  )
}

export default NavItem
