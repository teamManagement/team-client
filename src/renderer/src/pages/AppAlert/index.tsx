import AppOpenTitle from '@renderer/components/AppOpenTitle'
import { title } from 'process'
import { FC, useCallback, useEffect, useState } from 'react'
import { FullscreenIcon, JumpIcon, PinIcon, PoweroffIcon, RemoveIcon } from 'tdesign-icons-react'
import { Button } from 'tdesign-react'
import './index.scss'

export const AppAlert: FC = () => {
  const [appInfo, setAppInfo] = useState<AppInfo | undefined>(undefined)
  const queryAppInfo = useCallback(async () => {
    setAppInfo(await window.app.getCurrentAppInfo())
  }, [])

  useEffect(() => {
    queryAppInfo()
  }, [])

  return (
    <div className="app-alert">
      {appInfo && (
        <AppOpenTitle
          drag
          title={appInfo.name}
          iconUrl={appInfo.icon}
          startEle={
            <Button key="pin" title="置顶" shape="square" variant="text" icon={<PinIcon />} />
          }
          endEle={[
            <Button
              key="restore"
              title="还原"
              shape="square"
              variant="text"
              icon={
                <JumpIcon
                  style={{
                    transform: 'rotate(180deg)'
                  }}
                  size="22px"
                />
              }
            />,
            <Button
              key="hide"
              title="缩小到任务栏"
              shape="square"
              variant="text"
              icon={<RemoveIcon size="22px" />}
            />,
            <Button
              key="fullscreen"
              title="全屏"
              shape="square"
              variant="text"
              icon={<FullscreenIcon size="22px" />}
            />,
            <Button
              // onClick={onAppClose}
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
