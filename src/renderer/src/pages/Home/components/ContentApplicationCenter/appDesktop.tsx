import { FC, useCallback, useMemo, useState, MouseEvent, useEffect } from 'react'
import AppItem from '@renderer/components/AppItem'
import { MessagePlugin } from 'tdesign-react'
import Loading from '@renderer/components/Loading'

// 用?解决appErr路由引发的对象不存在的bug
const appDesktopContextMenu = window.electron?.ContextMenu.getById('appDesktopContextMenu')
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
;(async () => {
  if (!appDesktopContextMenu) {
    return
  }
  await appDesktopContextMenu.clearItems()
  await appDesktopContextMenu.appendMenuItem({ id: 'refresh', label: '刷新' })
})()

const appStoreInfo: AppInfo = {
  id: '1',
  name: '应用商店',
  inside: true,
  type: (window as any).AppType?.REMOTE_WEB,
  remoteSiteUrl: 'https://baidu.com',
  url: 'https://www.baidusdf.com',
  icon: 'https://127.0.0.1:65528/icons/appstore.png',
  iconType: (window as any).IconType?.URL,
  desc: '应用商店',
  shortDesc: '应用商店',
  version: '0.0.1'
}

export interface AppDesktopContextMenuEvent {
  refresh: () => Promise<void>
  event: MouseEvent<HTMLDivElement>
}

export interface AppDesktop {
  showContextMenu?: boolean
  onlyShowOpened?: boolean
  openedAppIdList: string[]
  onOpen: (app: AppInfo) => void
}

export const AppDesktop: FC<AppDesktop> = ({
  showContextMenu,
  onlyShowOpened,
  openedAppIdList,
  onOpen
}) => {
  const [appList, setAppList] = useState<AppInfo[]>([])
  const [loadingDesc, setLoadingDesc] = useState<string>('')

  const forceRefreshAppList = useCallback(async () => {
    setLoadingDesc('正在刷新应用列表...')
    try {
      const appList: AppInfo[] =
        (await window.proxyApi.httpLocalServerProxy('/app/force/refresh')) || []
      appList.push(appStoreInfo)
      setAppList(appList)
    } catch (e) {
      MessagePlugin.error('刷新应用列表失败: ' + (e as any).message)
    } finally {
      setLoadingDesc('')
    }
  }, [])

  const queryAppList = useCallback(async () => {
    setLoadingDesc('正在加载应用列表...')
    try {
      const appList: AppInfo[] =
        (await window.proxyApi.httpLocalServerProxy('/app/info/desktop/list')) || []
      appList.push(appStoreInfo)
      setAppList(appList)
    } catch (e) {
      MessagePlugin.error('获取应用列表失败: ' + (e as any).message)
    } finally {
      setLoadingDesc('')
    }
  }, [])

  useEffect(() => {
    appDesktopContextMenu.registerItemClick('refresh', forceRefreshAppList)
  }, [])

  useEffect(() => {
    queryAppList()
  }, [queryAppList])

  const appElementList = useMemo(() => {
    let convertAppList = appList
    if (onlyShowOpened) {
      convertAppList = convertAppList.filter((val) => openedAppIdList.includes(val.id))
    }
    return convertAppList.map((app) => {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      const appClick = () => {
        onOpen(app)
      }
      return (
        <div className="item" key={app.id}>
          <AppItem onClick={appClick} isOpened={openedAppIdList.includes(app.id)} info={app} />
        </div>
      )
    })
  }, [appList, openedAppIdList, onlyShowOpened])

  const onContextMenuWrapper = useCallback(() => {
    if (!showContextMenu) {
      return
    }
    appDesktopContextMenu.popup()
  }, [])

  return (
    <div className="app-desktop" onContextMenu={onContextMenuWrapper}>
      {appElementList}
      {loadingDesc && <Loading desc={loadingDesc} />}
    </div>
  )
}
