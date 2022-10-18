import { FC, useCallback, useMemo, useState, MouseEvent, useEffect } from 'react'
import AppItem from '@renderer/components/AppItem'
import { loading, MessagePlugin } from 'tdesign-react'

const appDesktopContextMenu = window.electron.ContextMenu.getById('appDesktopContextMenu')
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
;(async () => {
  await appDesktopContextMenu.clearItems()
  await appDesktopContextMenu.appendMenuItem({ id: 'refresh', label: '刷新' })
})()

export interface AppDesktopContextMenuEvent {
  refresh: () => Promise<void>
  event: MouseEvent<HTMLDivElement>
}

export interface AppDesktop {
  showContextMenu?: boolean
}

export const AppDesktop: FC<AppDesktop> = ({ showContextMenu }) => {
  const [appList, setAppList] = useState<AppInfo[]>([])

  const forceRefreshAppList = useCallback(async () => {
    const loadInstance = loading(true)
    try {
      setAppList((await window.proxyApi.httpLocalServerProxy('/app/force/refresh')) || [])
    } catch (e) {
      MessagePlugin.error('刷新应用列表失败: ' + (e as any).message)
    } finally {
      loadInstance.hide()
    }
  }, [])

  const queryAppList = useCallback(async () => {
    const loadInstance = loading(true)
    try {
      setAppList((await window.proxyApi.httpLocalServerProxy('/app/info/desktop/list')) || [])
    } catch (e) {
      MessagePlugin.error('获取应用列表失败: ' + (e as any).message)
    } finally {
      loadInstance.hide()
    }
  }, [])

  useEffect(() => {
    appDesktopContextMenu.registerItemClick('refresh', forceRefreshAppList)
  }, [])

  useEffect(() => {
    queryAppList()
  }, [queryAppList])

  const appElementList = useMemo(() => {
    return appList.map((app) => {
      return (
        <div className="item" key={app.id}>
          <AppItem info={app} />
        </div>
      )
    })
  }, [appList])

  const onContextMenuWrapper = useCallback(() => {
    if (!showContextMenu) {
      return
    }
    appDesktopContextMenu.popup()
  }, [])

  return (
    <div className="app-desktop" onContextMenu={onContextMenuWrapper}>
      {appElementList}
    </div>
  )
}
