import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Input, InputValue, MessagePlugin } from 'tdesign-react'
import { Tabs } from 'antd'
import {
  AddIcon,
  SearchIcon,
  AppIcon,
  FormatHorizontalAlignCenterIcon,
  RollbackIcon,
  JumpIcon,
  PoweroffIcon
} from 'tdesign-icons-react'
import 'antd/dist/antd.css'
import './index.scss'
import { AppDesktop } from './appDesktop'
import Loading from '@renderer/components/Loading'
import AppOpenTitle from '@renderer/components/AppOpenTitle'

export const ContentApplicationCenter: FC = () => {
  const applicationCenterEle = useRef<HTMLDivElement>(null)

  const [loadingDesc, setLoadingDesc] = useState<string>('')
  const [openedAppIdList, setOpenedAppIdList] = useState<string[]>(window.app.getOpenedIdList())
  const [nowOpenApp, setNowOpenApp] = useState<AppInfo | undefined>(undefined)
  const [keyword, setKeyword] = useState<string | undefined>(undefined)
  const [openTitleDisabled, setOpenTitleDisabled] = useState<boolean>(false)
  useEffect(() => {
    window.app.restore().then((app) => {
      if (app && app.loading) {
        setLoadingDesc('正在加载应用')
        setOpenTitleDisabled(true)
      }
      setNowOpenApp(app)
    })
    return () => {
      window.app.hangUp()
    }
  }, [])

  useEffect(() => {
    const appOpenedNoticeEvent: (
      appInfo: AppInfo,
      status: 'open' | 'close' | 'showTitle'
    ) => void = (appInfo: AppInfo, status: 'open' | 'close' | 'showTitle') => {
      const id = appInfo.id
      setOpenedAppIdList((idList) => {
        const targetIdList = [...idList]
        const index = idList.indexOf(id)
        if (status === 'showTitle') {
          setNowOpenApp(appInfo)
          return idList
        } else if (status === 'open') {
          if (!appInfo.loading) {
            setOpenTitleDisabled(false)
            setLoadingDesc('')
          }

          if (index === -1) {
            console.log('打开...')
            targetIdList.push(id)
          } else {
            console.log('打开原有')
            return idList
          }
        } else {
          if (index >= 0) {
            targetIdList.splice(index, 1)
          } else {
            return idList
          }
        }
        return targetIdList
      })
      if (status === 'close') {
        setNowOpenApp((app) => {
          if (app?.id === id) {
            return undefined
          }
          return app
        })
      }
    }

    const listenId = 'appStatusListener'
    window.app.listenStatusNotice(listenId, appOpenedNoticeEvent)
    return () => {
      window.app.removeStatusNotice(listenId)
    }
  }, [])

  const appOpen = useCallback(async (app: AppInfo) => {
    setLoadingDesc('正在打开应用...')
    try {
      setOpenTitleDisabled(true)
      await window.app.openApp(app)
    } catch (e) {
      MessagePlugin.error(e as string)
    } finally {
      setOpenTitleDisabled(false)
      setLoadingDesc('')
    }
  }, [])

  const onAppClose = useCallback(async () => {
    if (!nowOpenApp) {
      return
    }
    await window.app.destroyById(nowOpenApp.id)
  }, [nowOpenApp])

  const onAppAlert = useCallback(async () => {
    try {
      setOpenTitleDisabled(true)
      if (!nowOpenApp) {
        return
      }
      await window.app.currentShowInAlert()
      setNowOpenApp(undefined)
    } catch (e) {
      MessagePlugin.error((e as any).message || e)
    } finally {
      setOpenTitleDisabled(false)
    }
  }, [nowOpenApp])

  const onCallbackToDesktop = useCallback(() => {
    window.app.hideEndOpenedApp()
    setNowOpenApp(undefined)
  }, [])

  const appDesktopTabs = useMemo(() => {
    const result = [
      {
        label: (
          <span className="app-item">
            <AppIcon />
            <span>全部</span>
          </span>
        ),
        key: 'default',
        children: (
          <AppDesktop
            keyword={keyword}
            onOpen={appOpen}
            openedAppIdList={openedAppIdList}
            showContextMenu
          />
        )
      } // 务必填写 key
    ]

    if (openedAppIdList.length > 0) {
      result.push({
        label: (
          <span className="app-item">
            <FormatHorizontalAlignCenterIcon />
            <span>正在使用</span>
          </span>
        ),
        key: 'item-2',
        children: (
          <AppDesktop
            keyword={keyword}
            onOpen={appOpen}
            openedAppIdList={openedAppIdList}
            onlyShowOpened
          />
        )
      })
    }

    return result
  }, [openedAppIdList, keyword])

  const searchInputOnChange = useCallback((val: InputValue) => {
    setKeyword(val.toString())
  }, [])

  return (
    <div className="application-center match-parent" ref={applicationCenterEle}>
      {nowOpenApp && (
        <AppOpenTitle
          iconUrl={nowOpenApp.icon}
          title={nowOpenApp.name}
          endEle={[
            <Button
              disabled={openTitleDisabled}
              onClick={onAppAlert}
              title="弹出"
              key="jump"
              shape="square"
              variant="text"
              icon={<JumpIcon size="22px" />}
            />,
            <Button
              disabled={openTitleDisabled}
              onClick={onAppClose}
              title="关闭"
              key="close"
              shape="square"
              variant="text"
              theme="danger"
              icon={<PoweroffIcon size="22px" />}
            />
          ]}
          startEle={
            <Button
              disabled={openTitleDisabled}
              onClick={onCallbackToDesktop}
              title="返回桌面"
              shape="square"
              variant="text"
              icon={<RollbackIcon size="22px" />}
            />
          }
        />
      )}
      <div className="search">
        <Input
          onChange={searchInputOnChange}
          prefixIcon={<SearchIcon />}
          style={{ width: 280 }}
          placeholder="请输入要搜索的应用名称"
        />
      </div>
      <div className="application-container">
        <Tabs
          style={{ height: '100%', paddingTop: 8 }}
          tabPosition="left"
          tabBarExtraContent={{
            right: (
              <Button variant="text" icon={<AddIcon />}>
                自定义分类
              </Button>
            )
          }}
          items={appDesktopTabs}
        />
      </div>
      {loadingDesc && <Loading desc={loadingDesc} />}
    </div>
  )
}

export default ContentApplicationCenter
