import { FC, useMemo } from 'react'
import './index.scss'

export interface AppItemProps {
  iconSize?: number
  info: AppInfo
}

const undefinedIconUrl = 'https://apps.byzk.cn/icons/undefined.png'

export const AppItem: FC<AppItemProps> = ({ iconSize, info }) => {
  const icon = useMemo(() => {
    switch (info.iconType) {
      case IconType.URL:
        return info.icon || undefinedIconUrl
      default:
        return undefinedIconUrl
    }
  }, [])
  return (
    <div className="application-item" title={info.name} style={{ width: iconSize }}>
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
