import { BrowserWindow } from 'electron'
import { WinNameEnum } from '../../current'
import { SettingWindow } from '../common'

export async function SettingHomeWin(showOperation?: () => void): Promise<BrowserWindow> {
  return await SettingWindow(
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
      readyToShowFn: (win) => {
        win.show()
        if (showOperation) {
          showOperation()
        }
      }
    }
  )
}
