import AppOpenTitle from '@renderer/components/AppOpenTitle'
import { CSSProperties, FC, useCallback, useMemo, useState } from 'react'
import {
  FullscreenExitIcon,
  FullscreenIcon,
  PinFilledIcon,
  PinIcon,
  PoweroffIcon,
  RemoveIcon
} from 'tdesign-icons-react'
import { Button } from 'tdesign-react'
import { applications, currentWindow, electron, AppInfo } from '@byzk/teamwork-inside-sdk'
import './index.scss'
import IconFont from '@renderer/components/IconFont'

export const AppAlert: FC = () => {
  const [isFull, setIsFull] = useState<boolean>(false)
  const [isOnTop, setIsOnTop] = useState<boolean>(false)
  const [appInfo] = useState<AppInfo | undefined>(applications.getCurrentAppInfo())

  const onFullscreen = useCallback(() => {
    setIsFull((full) => {
      if (full) {
        currentWindow.unmaximize()
      } else {
        currentWindow.maximize()
      }
      return !full
    })
  }, [])

  const onHide = useCallback(() => {
    currentWindow.minimize()
  }, [])

  const onClose = useCallback(() => {
    if (!appInfo) {
      return
    }
    applications.destroyAlertById(appInfo.id)
  }, [appInfo])

  const onAlwaysTop = useCallback(() => {
    setIsOnTop((top) => {
      if (top) {
        currentWindow.unAlwaysOnTop()
      } else {
        currentWindow.alwaysOnTop()
      }
      return !top
    })
  }, [])

  const fullIcon = useMemo(() => {
    const style = { transform: 'rotate(90deg)' } as CSSProperties
    const size = '22px'
    return !isFull ? (
      <FullscreenIcon style={style} size={size} />
    ) : (
      <FullscreenExitIcon style={style} size={size} />
    )
  }, [isFull])

  const onTopIcon = useMemo(() => {
    const size = '22px'
    return isOnTop ? <PinFilledIcon size={size} /> : <PinIcon size={size} />
  }, [isOnTop])

  return (
    <div className="app-alert">
      {appInfo && (
        <AppOpenTitle
          drag
          title={appInfo.name}
          iconUrl={appInfo.icon}
          startEle={[
            <Button
              onClick={onAlwaysTop}
              key="alwaysOnTop"
              title="置顶"
              shape="square"
              variant="text"
              icon={onTopIcon}
            />,
            (electron.isDev || appInfo.debugging) && (
              <Button
                key="debugging"
                onClick={currentWindow.openBrowserViewDevTools}
                title="打开控制面板"
                shape="square"
                variant="text"
                icon={<IconFont size="21px" name="bug" />}
              />
            )
          ]}
          endEle={[
            // TODO 事件实现逻辑有点复杂
            // TODO 需要将应用桌面的nowApp信息变化监听从render中移动到preload并由主进程进行触发
            // TODO 这一版赶时间, 下一版再说~~~
            // <Button
            //   key="restore"
            //   title="还原"
            //   shape="square"
            //   variant="text"
            //   icon={
            //     <JumpIcon
            //       style={{
            //         transform: 'rotate(180deg)'
            //       }}
            //       size="22px"
            //     />
            //   }
            // />,
            <Button
              onClick={onHide}
              key="hide"
              title="最小化"
              shape="square"
              variant="text"
              icon={<RemoveIcon size="22px" />}
            />,
            <Button
              onClick={onFullscreen}
              key="fullscreen"
              title="最大化"
              shape="square"
              variant="text"
              icon={fullIcon}
            />,
            <Button
              onClick={onClose}
              title="关闭"
              key="close"
              shape="square"
              variant="text"
              theme="danger"
              icon={<PoweroffIcon size="22px" />}
            />
          ]}
        />
      )}
    </div>
  )
}

export default AppAlert
