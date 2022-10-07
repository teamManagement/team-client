import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { ResponseError, sendHttpRequestToLocalWebServer } from '../tools'
import { promiseErrWrapper } from '../tools/wrapper'

export function initMainProcessEvents(): void {
  ipcMain.handle('ipc-proxy-web-server', proxyWebServer)
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
