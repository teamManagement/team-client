import { BrowserWindow } from 'electron'
import { WinNameEnum } from '../../current'
import { SettingWindow } from '../common'

export async function SettingLoginWin(showOperation?: () => void): Promise<BrowserWindow> {
  return await SettingWindow(
    WinNameEnum.LOGIN,
    {
      width: 420,
      height: 328,
      frame: false,
      resizable: false,
      transparent: true,
      maximizable: false,
      minimizable: false,
      alwaysOnTop: true
    },
    '/login',
    true,
    {
      readyToShowFn: (win) => {
        if (showOperation) {
          showOperation()
        }
        win.show()
      }
    }
  )
}
