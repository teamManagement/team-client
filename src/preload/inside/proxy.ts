import { ipcRenderer } from 'electron'

interface HttpOptions {
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'OPTION'
  jsonData?: any
  header?: { [key: string]: string }
}

/**
 * 响应错误
 */
interface ResponseError {
  error?: boolean
  /**
   * 状态码
   */
  httpCode: number

  /**
   * 错误码
   */
  code: string

  /**
   * 错误消息
   */
  message: string

  /**
   * 原始数据
   */
  raw: string
}

async function httpProxyHandler<T>(
  eventName: string,
  url: string,
  options: HttpOptions
): Promise<T> {
  const response = (await ipcRenderer.invoke(
    eventName,
    url,
    JSON.stringify(options)
  )) as ResponseError

  if (response.error) {
    throw response
  }
  return response as any
}

interface TcpTransferInfo<T> {
  cmdCode: number
  data: T
  errMsg: string
  dataType: number
}

let _registerServerMsgTransferEventOk = false

const _registerServerMsgHandlerList: ((data: TcpTransferInfo<any>) => void)[] = []

async function _registerServerMsgIpcEvent(): Promise<void> {
  if (_registerServerMsgTransferEventOk) {
    return
  }
  _registerServerMsgTransferEventOk = true

  ipcRenderer.addListener('ipc-serverMsgTransferEvent', (_event, data: string) => {
    try {
      const tcpTransferData = JSON.parse(data) as TcpTransferInfo<any>
      if (tcpTransferData.data) {
        const buf = Buffer.from(tcpTransferData.data, 'base64')
        const dataStr = buf.toString()
        if (tcpTransferData.dataType === 0) {
          try {
            tcpTransferData.data = JSON.parse(dataStr)
          } catch (e) {
            //ignore
          }
        } else {
          tcpTransferData.data = dataStr
        }
      }

      console.log(tcpTransferData)
      for (const _fn of _registerServerMsgHandlerList) {
        _fn(tcpTransferData)
      }
    } catch (e) {
      //ignore
    }
  })
  await ipcRenderer.invoke('ipc-serverMsgTransferEvent')
}

async function registerServerMsgTransferEvent<T>(
  fn: (data: TcpTransferInfo<T>) => void
): Promise<void> {
  if (!_registerServerMsgTransferEventOk) {
    _registerServerMsgIpcEvent()
  }
  for (const _fn of _registerServerMsgHandlerList) {
    if (_fn === fn) {
      return
    }
  }

  _registerServerMsgHandlerList.push(fn)
}

function removeServerMsgTransferEvent(fn: (data: TcpTransferInfo<any>) => void): void {
  for (let i = 0; i < _registerServerMsgHandlerList.length; i++) {
    const _fn = _registerServerMsgHandlerList[i]
    if (_fn === fn) {
      _registerServerMsgHandlerList.splice(i, 1)
      return
    }
  }
}

export interface ProxyApi {
  httpWebServerProxy<T>(url: string, options: HttpOptions): Promise<T>
  httpLocalServerProxy<T>(url: string, options: HttpOptions): Promise<T>
  registerServerMsgHandler<T>(fn: (data: TcpTransferInfo<T>) => void): Promise<void>
  removeServerMsgHandler(fn: (data: TcpTransferInfo<any>) => void): void
}

export const proxyApi = {
  httpWebServerProxy: (url, options) => httpProxyHandler('ipc-proxy-web-server', url, options),
  httpLocalServerProxy: (url, options) => httpProxyHandler('ipc-proxy-local-server', url, options),
  registerServerMsgHandler: registerServerMsgTransferEvent,
  removeServerMsgHandler: removeServerMsgTransferEvent
} as ProxyApi

export enum TcpTransferCmdCode {
  BLOCKING_CONNECTION,
  RESTORE_SERVER_ERR,
  RESTORE_SERVER_OK
}
