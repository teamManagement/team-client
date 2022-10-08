import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { CurrentInfo, WinNameEnum } from '../current'
import { WsHandler } from '../socket'
import { ResponseError, sendHttpRequestToLocalWebServer } from '../tools'
import { promiseErrWrapper } from '../tools/wrapper'
import { SettingHomeWin } from '../windows/home'

export function initMainProcessEvents(): void {
  ipcMain.handle('ipc-proxy-web-server', proxyWebServer)
  ipcMain.handle('ipc-login', login)
}

async function login(_event: IpcMainInvokeEvent, username: string, password: string): Promise<any> {
  try {
    await WsHandler.instance.login(username, password)
    await SettingHomeWin((win) => {
      CurrentInfo.getWin(WinNameEnum.LOGIN)?.close()
      win.show()
    })
    return {}
  } catch (e) {
    return { error: true, message: (e as any).message || e }
  }
}

async function proxyWebServer(
  _event: IpcMainInvokeEvent,
  url: string,
  options?: string
): Promise<any> {
  options = options || '{}'
  return promiseErrWrapper<any, ResponseError>(
    sendHttpRequestToLocalWebServer(url, JSON.parse(options))
  )
}
