import { FC } from 'react'
import './index.scss'
import CloseAppBtn from '@renderer/components/CloseAppBtn'

export const WindowToolbar: FC = () => {
  return (
    <div className="window-toolbar electron-drag">
      <CloseAppBtn
        color="#fff"
        style={{ marginRight: 8 }}
        iconStyle={{ transform: 'scale(1.2)' }}
        hide
      />
    </div>
  )
}

export default WindowToolbar
