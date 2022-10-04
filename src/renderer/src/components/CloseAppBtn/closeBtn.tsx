import React, { FC, useCallback, useState } from 'react'
import { Button } from 'tdesign-react'
import { CloseIcon } from 'tdesign-icons-react'

export interface CloseAppBtnProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  style?: React.CSSProperties
  iconStyle?: React.CSSProperties
  hide?: boolean
}

export const CloseAppBtn: FC<CloseAppBtnProps> = ({ size, color, style, iconStyle, hide }) => {
  const [hover, setHover] = useState<boolean>(false)

  const btnEnter = useCallback(() => {
    setHover(true)
  }, [])

  const btnLeave = useCallback(() => {
    setHover(false)
  }, [])

  const btnClick = useCallback(() => {
    if (hide) {
      window.electron.ipcRenderer.send('appHide')
      return
    }
    window.electron.ipcRenderer.send('appExit', 0)
  }, [])

  return (
    <Button
      className="electron-no-drag"
      onClick={btnClick}
      onMouseEnter={btnEnter}
      onMouseLeave={btnLeave}
      theme={hover ? 'danger' : 'default'}
      size={size}
      variant={hover ? 'base' : 'text'}
      style={{ ...style, color: hover ? '' : color }}
      shape="circle"
      icon={<CloseIcon style={iconStyle} />}
    />
  )
}

export default CloseAppBtn
