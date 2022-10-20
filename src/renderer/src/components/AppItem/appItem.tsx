import { FC, useMemo, MouseEventHandler } from 'react'
import classNames from 'classnames'
import './index.scss'

export interface AppItemProps {
  iconSize?: number
  isOpened?: boolean
  onClick?: MouseEventHandler<HTMLDivElement>
  onContextMenu?: MouseEventHandler<HTMLDivElement>
  info: AppInfo
}

const undefinedIconUrl = 'https://apps.byzk.cn/icons/undefined.png'

export const AppItem: FC<AppItemProps> = ({ iconSize, info, isOpened, onClick, onContextMenu }) => {
  const icon = useMemo(() => {
    switch (info.iconType) {
      case IconType.URL:
        return info.icon || undefinedIconUrl
      default:
        return undefinedIconUrl
    }
  }, [])
  return (
    <div
      className={classNames('application-item', { opened: isOpened })}
      title={info.name}
      style={{ width: iconSize }}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <div
        style={{
          width: iconSize,
          height: iconSize
        }}
        className="icon"
      >
        <img src={icon} />
      </div>
      <div className="text">{info.name}</div>
    </div>
  )
}

export default AppItem
