import { FC, useCallback, useMemo, MouseEvent, useEffect, useRef } from 'react'
import { contextmenu, AppInfo, ContextMenu } from '@teamworktoolbox/inside-sdk'
import AppItem from '@renderer/components/AppItem'

export interface AppDesktopContextMenuEvent {
  refresh: () => Promise<void>
  event: MouseEvent<HTMLDivElement>
}

export interface AppDesktop {
  showContextMenu?: boolean
  onlyShowOpened?: boolean
  keyword?: string
  openedAppIdList: string[]
  onOpen: (app: AppInfo) => void
  appList: AppInfo[]
  forceRefreshAppList: () => void
  onlyShowDebugging?: boolean
}

export const AppDesktop: FC<AppDesktop> = ({
  showContextMenu,
  onlyShowOpened,
  openedAppIdList,
  keyword,
  onOpen,
  appList,
  forceRefreshAppList,
  onlyShowDebugging
}) => {
  const contextMenu = useRef<ContextMenu | null>()

  useEffect(() => {
    if (!showContextMenu) {
      return
    }
    contextMenu.current = contextmenu.build(
      [
        {
          label: '刷新',
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          click() {
            forceRefreshAppList()
          }
        }
      ],
      'desktop-refresh'
    )

    return () => {
      contextmenu.clear('desktop-refresh')
      contextMenu.current = null
    }
  }, [showContextMenu])

  const appElementList = useMemo(() => {
    const convertAppList = appList.filter((val) => {
      if (onlyShowDebugging && !val.debugging) {
        return false
      }

      if (!onlyShowDebugging && val.debugging) {
        return false
      }

      if (onlyShowOpened && !openedAppIdList.includes(val.id)) {
        return false
      }

      if (keyword && !val.name.includes(keyword)) {
        return false
      }

      return true
    })

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
  }, [appList, openedAppIdList, onlyShowOpened, keyword])

  const onContextMenuWrapper = useCallback(() => {
    if (!showContextMenu) {
      return
    }
    if (contextMenu.current) {
      contextMenu.current.popup()
    }
  }, [])

  return (
    <div className="app-desktop" onContextMenu={onContextMenuWrapper}>
      {appElementList}
    </div>
  )
}
