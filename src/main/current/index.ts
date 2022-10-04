import { BrowserWindow, Tray, WebContents } from 'electron'

export const winWebContentsIdMap: { [key: number]: WebContents } = {}
export const applicationWebcontentsMap: {
  [key: string]: {
    id: string
    name: string
    desc?: string
    icon?: string
    webContentsId: number
  }
} = {}

export enum WinNameEnum {
  LOGIN = 'login',
  HOME = 'home'
}

/**
 * 窗口对象Map
 */
interface WinMap {
  [key: string]: BrowserWindow | undefined
}

export class CurrentInfo {
  private static _appTray: Tray | undefined

  private static _currentWindow: BrowserWindow | undefined
  private static _currentWindowName: WinNameEnum | undefined
  private static _winMap: WinMap = {}

  public static sendMsgToAllWin(eventName: string, data?: unknown): void {
    for (const k in CurrentInfo._winMap) {
      try {
        const win = CurrentInfo._winMap[k]
        win && win.webContents && win.webContents.send(eventName, data)
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }
  }

  public static get AppTray(): Tray | undefined {
    return CurrentInfo._appTray
  }

  public static set AppTray(tray: Tray | undefined) {
    CurrentInfo._appTray = tray
  }

  public static get CurrentWindow(): BrowserWindow | undefined {
    return CurrentInfo._currentWindow
  }

  public static get CurrentWindowName(): WinNameEnum | undefined {
    return CurrentInfo._currentWindowName
  }

  public static SettingCurrentWindow(name: WinNameEnum | undefined): void {
    if (!name) {
      CurrentInfo._currentWindow = undefined
      CurrentInfo._currentWindowName = undefined
      return
    }
    CurrentInfo._currentWindow = CurrentInfo._winMap[name]
    CurrentInfo._currentWindowName = name
  }

  public static addWin(name: WinNameEnum, win: BrowserWindow | undefined, isCurrent = false): void {
    const srcWin = CurrentInfo._winMap[name]
    if (srcWin) {
      srcWin.close()
    }

    CurrentInfo._winMap[name] = win
    if (isCurrent) {
      CurrentInfo._currentWindow = win
      CurrentInfo._currentWindowName = name
    }
  }

  public static getWin(name: WinNameEnum): BrowserWindow | undefined {
    return CurrentInfo._winMap[name]
  }

  public static setWin(name: WinNameEnum, win: BrowserWindow | undefined, isCurrent = false): void {
    if (!win) {
      if (CurrentInfo._currentWindowName === name) {
        CurrentInfo._currentWindowName = undefined
        CurrentInfo._currentWindow = undefined
      }
      delete CurrentInfo._winMap[name]
      return
    }
    CurrentInfo.addWin(name, win, isCurrent)
  }
}
