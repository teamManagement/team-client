import { BrowserWindow } from 'electron'
import { WinNameEnum } from '../../current'
import { SettingWindow } from '../common'

export async function SettingUserinfoAlert(): Promise<BrowserWindow> {
  const win = await SettingWindow(
    WinNameEnum.USERINFO,
    {
      width: 340,
      height: 490,
      frame: false,
      resizable: false,
      maximizable: false,
      minimizable: false,
      transparent: true,
      show: false,
      modal: true
    },
    '/userinfo',
    false,
    {
      readyToShowFn(win) {
        win.hide()
      }
    },
    true
  )

  win.addListener('close', (event) => {
    event.preventDefault()
    win.setParentWindow(null)
    win.hide()
  })

  return win
}
