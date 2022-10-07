import classNames from 'classnames'
import { FC, useMemo } from 'react'
import { Avatar as TAvatar, Badge } from 'tdesign-react'
import './index.scss'

export interface AvatarProps {
  iconUrl?: string
  name?: string
  shape?: 'circle' | 'round'
  size?: 'small' | 'medium' | 'large' | string
  className?: string
  style?: React.CSSProperties
  status?: 'online' | 'offline'
  statusOffset?: [number, number]
  disabledNameAutoLen?: boolean
}

export const Avatar: FC<AvatarProps> = ({
  iconUrl,
  status,
  name,
  shape,
  size,
  statusOffset = [42, 8],
  disabledNameAutoLen,
  ...otherProps
}) => {
  const showName = useMemo<string | undefined>(() => {
    if (disabledNameAutoLen) {
      return name
    }
    if (!name || name.length <= 2) {
      return name
    }
    return name.substring(name.length - 2)
  }, [name])

  const showStatus = useMemo(() => !!status, [status])

  return (
    <div className="avatar">
      <Badge
        className={classNames('status', status)}
        showZero={showStatus}
        dot
        offset={statusOffset}
      >
        <Badge className="status-background" dot showZero={showStatus} offset={statusOffset}>
          <TAvatar {...otherProps} hideOnLoadFailed image={iconUrl} shape={shape} size={size}>
            {showName}
          </TAvatar>
        </Badge>
      </Badge>
    </div>
  )
}

export default Avatar
