import { app, dialog } from 'electron'
import { CurrentInfo, WinNameEnum } from '../current'
import { AppIcon } from '../icons'
import { DialogTopWin } from './common'
import { SettingLoginWin } from './login'

export function alertPanic(message: string): void {
  dialog.showMessageBoxSync(DialogTopWin(), {
    type: 'error',
    title: '致命错误',
    message,
    icon: AppIcon,
    buttons: ['确定']
  })
  app.exit(1)
}

export function alertMsgAndRelaunch(message: string): void {
  dialog.showMessageBoxSync(DialogTopWin(), {
    type: 'warning',
    title: '应用警告',
    message,
    icon: AppIcon,
    buttons: ['确定']
  })

  CurrentInfo.getWin(WinNameEnum.HOME)?.hide()
  SettingLoginWin()
  CurrentInfo.getWin(WinNameEnum.HOME)?.destroy()
  CurrentInfo.setWin(WinNameEnum.HOME, undefined)
}
