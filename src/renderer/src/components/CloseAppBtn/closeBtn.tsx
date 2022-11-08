import React, { FC, useCallback, useState } from 'react'
import { Button } from 'tdesign-react'
import { CloseIcon } from 'tdesign-icons-react'
import { electron } from '@byzk/teamwork-inside-sdk'

export interface CloseAppBtnProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  style?: React.CSSProperties
  iconStyle?: React.CSSProperties
  hide?: boolean
  onClick?: () => void
}

export const CloseAppBtn: FC<CloseAppBtnProps> = ({
  size,
  color,
  style,
  iconStyle,
  hide,
  onClick
}) => {
  const [hover, setHover] = useState<boolean>(false)

  const btnEnter = useCallback(() => {
    setHover(true)
  }, [])

  const btnLeave = useCallback(() => {
    setHover(false)
  }, [])

  const btnClick = useCallback(() => {
    if (onClick) {
      onClick()
      return
    }
    if (hide) {
      electron.ipcRenderer.send('appHide')
      return
    }
    electron.ipcRenderer.send('appExit', 0)
  }, [])

  return (
    <Button
      className="electron-no-drag close-app-btn"
      onClick={btnClick}
      onMouseEnter={btnEnter}
      onMouseLeave={btnLeave}
      theme={hover ? 'danger' : 'default'}
      size={size}
      variant={hover ? 'base' : 'text'}
      style={{ ...style, color: hover ? '' : color }}
      shape="circle"
      icon={<CloseIcon size={22} style={iconStyle} />}
    />
  )
}

export default CloseAppBtn
