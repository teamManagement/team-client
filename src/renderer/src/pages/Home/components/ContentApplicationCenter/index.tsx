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
  PoweroffIcon,
  LogoAndroidIcon
} from 'tdesign-icons-react'
import {
  applications,
  electron,
  api,
  currentWindow,
  AppInfo,
  AppType
} from '@byzk/teamwork-inside-sdk'
import 'antd/dist/antd.css'
import './index.scss'
import { AppDesktop } from './appDesktop'
import Loading from '@renderer/components/Loading'
import AppOpenTitle from '@renderer/components/AppOpenTitle'
import IconFont from '@renderer/components/IconFont'

const appStoreInfo: AppInfo = {
  id: '0',
  name: '应用商店',
  inside: true,
  type: AppType.REMOTE_WEB,
  remoteSiteUrl: 'https://baidu.com',
  // url: 'http://192.168.3.81:3000',
  url: 'https://127.0.0.1:65528/appStoreView',
  icon: 'https://127.0.0.1:65528/icons/appstore.png',
  iconType: (window as any).IconType?.URL,
  desc: '应用商店',
  shortDesc: '应用商店',
  version: '0.1.0'
}

export const ContentApplicationCenter: FC = () => {
  const applicationCenterEle = useRef<HTMLDivElement>(null)

  const [loadingDesc, setLoadingDesc] = useState<string>('')
  const [openedAppIdList, setOpenedAppIdList] = useState<string[]>(applications.getOpenedIdList())
  const [nowOpenApp, setNowOpenApp] = useState<AppInfo | undefined>(undefined)
  const [keyword, setKeyword] = useState<string | undefined>(undefined)
  const [openTitleDisabled, setOpenTitleDisabled] = useState<boolean>(false)
  const [haveDebugApp, setHaveDebugApp] = useState<boolean>(false)
  const [appList, setAppList] = useState<AppInfo[]>([])

  const filterDebugApp = useCallback((appList: AppInfo[]) => {
    setHaveDebugApp(
      !!appList.find((app) => {
        return app.debugging
      })
    )
  }, [])

  const forceRefreshAppList = useCallback(async () => {
    setLoadingDesc('正在刷新应用列表...')
    try {
      await api.proxyHttpLocalServer('/app/force/refresh')
      queryAppList()
      // appList.push(appStoreInfo)
      // filterDebugApp(appList)
      // setAppList(appList)
    } catch (e) {
      MessagePlugin.error('刷新应用列表失败: ' + (e as any).message)
    } finally {
      setLoadingDesc('')
    }
  }, [])

  const queryAppList = useCallback(async () => {
    setLoadingDesc('正在加载应用列表...')
    try {
      const appList: AppInfo[] = (await api.proxyHttpLocalServer('/app/info/desktop/list')) || []
      appList.push(appStoreInfo)
      filterDebugApp(appList)
      setAppList(appList)
    } catch (e) {
      MessagePlugin.error('获取应用列表失败: ' + (e as any).message)
    } finally {
      setLoadingDesc('')
    }
  }, [])

  useEffect(() => {
    const desktopRefresh: () => void = () => {
      queryAppList()
    }
    electron.ipcRenderer.on('desktop-refresh', desktopRefresh)
    return () => {
      electron.ipcRenderer.removeListener('desktop-refresh', desktopRefresh)
    }
  }, [queryAppList])

  useEffect(() => {
    queryAppList()
  }, [queryAppList])

  useEffect(() => {
    applications.restore().then((app) => {
      if (app && app.loading) {
        setLoadingDesc('正在加载应用')
        setOpenTitleDisabled(true)
      }
      setNowOpenApp(app)
    })
    return () => {
      applications.hangUp()
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
    applications.listenStatusNotice(listenId, appOpenedNoticeEvent)
    return () => {
      applications.removeStatusNotice(listenId)
    }
  }, [])

  const appOpen = useCallback(async (app: AppInfo) => {
    setLoadingDesc('正在打开应用...')
    try {
      setOpenTitleDisabled(true)
      await applications.openApp(app)
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
    await applications.destroyById(nowOpenApp.id)
  }, [nowOpenApp])

  const onAppAlert = useCallback(async () => {
    try {
      setOpenTitleDisabled(true)
      if (!nowOpenApp) {
        return
      }
      await applications.currentShowInAlert()
      setNowOpenApp(undefined)
    } catch (e) {
      MessagePlugin.error((e as any).message || e)
    } finally {
      setOpenTitleDisabled(false)
    }
  }, [nowOpenApp])

  const onCallbackToDesktop = useCallback(() => {
    applications.hideEndOpenedApp()
    setNowOpenApp(undefined)
  }, [])

  const appDesktopTabs = useMemo(() => {
    const result: any[] = []

    if (haveDebugApp) {
      result.push({
        label: (
          <span className="app-item">
            <LogoAndroidIcon />
            <span>正在调试</span>
          </span>
        ),
        key: 'debugging',
        children: (
          <AppDesktop
            onlyShowDebugging
            keyword={keyword}
            onOpen={appOpen}
            openedAppIdList={openedAppIdList}
            showContextMenu
            appList={appList}
            forceRefreshAppList={forceRefreshAppList}
          />
        )
      })
    }

    result.push(
      {
        label: (
          <span className="app-item">
            <AppIcon />
            <span>全部应用</span>
          </span>
        ),
        key: 'default',
        children: (
          <AppDesktop
            keyword={keyword}
            onOpen={appOpen}
            openedAppIdList={openedAppIdList}
            showContextMenu
            appList={appList}
            forceRefreshAppList={forceRefreshAppList}
          />
        )
      } // 务必填写 key
    )

    if (openedAppIdList.length > 0) {
      result.push({
        label: (
          <span className="app-item">
            <FormatHorizontalAlignCenterIcon />
            <span>正在使用</span>
          </span>
        ),
        key: 'item-nowUsing',
        children: (
          <AppDesktop
            keyword={keyword}
            onOpen={appOpen}
            openedAppIdList={openedAppIdList}
            onlyShowOpened
            appList={appList}
            forceRefreshAppList={forceRefreshAppList}
          />
        )
      })
    }

    return result
  }, [appList, openedAppIdList, keyword])

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
          startEle={[
            <Button
              key="callback"
              disabled={openTitleDisabled}
              onClick={onCallbackToDesktop}
              title="返回桌面"
              shape="square"
              variant="text"
              icon={<RollbackIcon size="22px" />}
            />,
            (electron.isDev || nowOpenApp.debugging) && (
              <Button
                key="debugging"
                onClick={currentWindow.openBrowserViewDevTools}
                disabled={openTitleDisabled}
                title="打开控制面板"
                shape="square"
                variant="text"
                icon={<IconFont size="21px" name="bug" />}
              />
            )
          ]}
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
