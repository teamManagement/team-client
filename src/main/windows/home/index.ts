import { app, BrowserWindow, Menu, Tray } from 'electron'
import { browserWindowListenViewResize } from '../../applications/manager'
import { CurrentInfo, WinNameEnum } from '../../current'
import { AppIcon } from '../../icons'
import { SettingWindow } from '../common'

let platformTray: Tray | undefined = undefined

export async function SettingHomeWin(
  showOperation?: (win: BrowserWindow) => void
): Promise<BrowserWindow> {
  const bw = await SettingWindow(
    WinNameEnum.HOME,
    {
      width: 1000,
      minWidth: 1000,
      height: 598,
      minHeight: 598,
      frame: false,
      resizable: true,
      transparent: true,
      maximizable: false,
      minimizable: false
    },
    '/home',
    true,
    {
      readyToShowFn(win) {
        initTray()
        if (showOperation) {
          showOperation(win)
        } else {
          win.show()
        }
      },
      closeFn() {
        if (!platformTray) {
          return
        }
        platformTray.destroy()
        platformTray = undefined
      }
    }
  )

  bw.addListener('close', (event) => {
    event.preventDefault()
    bw.hide()
  })

  browserWindowListenViewResize(bw)

  return bw
}

function initTray(): void {
  if (platformTray) {
    return
  }
  const menu = Menu.buildFromTemplate([
    {
      label: '打开',
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      click() {
        CurrentInfo.CurrentWindow?.show()
        CurrentInfo.CurrentWindow?.focus()
      }
    },
    { type: 'separator' },
    {
      label: '退出程序',
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      click() {
        app.exit(0)
      }
    }
  ])
  platformTray = new Tray(AppIcon)
  platformTray.setToolTip('Team Managed')
  platformTray.setContextMenu(menu)
  platformTray.addListener('double-click', () => {
    CurrentInfo.CurrentWindow?.show()
    CurrentInfo.CurrentWindow?.focus()
  })
}
