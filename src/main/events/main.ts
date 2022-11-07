import { ipcMain, IpcMainInvokeEvent } from 'electron'
import {
  ResponseError,
  sendHttpRequestToLocalServer,
  sendHttpRequestToCoreHttpServer
} from '../tools'
import { promiseErrWrapper } from '../tools/wrapper'

export function _initMainProcessEvents(): void {
  ipcMain.handle('ipc-proxy-web-server', proxyWebServer)
  ipcMain.handle('ipc-proxy-local-server', proxyLocalWebServer)
  // ipcMain.handle('ipc-login', login)
}

// async function login(_event: IpcMainInvokeEvent, username: string, password: string): Promise<any> {
//   try {
//     await WsHandler.instance.login(username, password)
//     await SettingHomeWin((win) => {
//       CurrentInfo.getWin(WinNameEnum.LOGIN)?.close()
//       win.show()
//     })
//     return {}
//   } catch (e) {
//     return { error: true, message: (e as any).message || e }
//   }
// }

async function proxyWebServer(
  _event: IpcMainInvokeEvent,
  url: string,
  options?: string
): Promise<any> {
  options = options || '{}'
  return promiseErrWrapper<any, ResponseError>(
    sendHttpRequestToCoreHttpServer(url, JSON.parse(options))
  )
}

async function proxyLocalWebServer(
  _event: IpcMainInvokeEvent,
  url: string,
  options?: string
): Promise<any> {
  options = options || '{}'
  return promiseErrWrapper<any, ResponseError>(
    sendHttpRequestToLocalServer(url, JSON.parse(options))
  )
}
