import { ipcRenderer } from 'electron'
import { uniqueId } from '../../../../main/security/random'

/**
 * tcp转换信息
 */
export interface TcpTransferInfo<T> {
  /**
   * cmd命令
   */
  cmdCode: number
  /**
   * 传输的数据
   */
  data: T
  /**
   * 错误信息
   */
  errMsg: string
  /**
   * 数据类别
   */
  dataType: number
}

/**
 * 是否完成注册，服务消息的转换事件
 */
let _registerServerMsgTransferEventOk = false
const _registerServerMsgHandlerList: ((data: TcpTransferInfo<any>) => void)[] = []

/**
 * 注册服务消息转换的ipc事件
 */
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

/**
 * 注册服务器转换数据处理方法
 * @param fn 处理方法
 * @returns 方法ID
 */
function registerServerMsgHandler<T>(fn: (data: TcpTransferInfo<T>) => void): string {
  const id = uniqueId()
  if (!_registerServerMsgTransferEventOk) {
    _registerServerMsgIpcEvent()
  }

  ;(fn as any)._id = id

  _registerServerMsgHandlerList.push(fn)
  return id
}

/**
 * 移除服务器数据转换处理方法
 * @param fnId 要移除的id
 */
function removeServerMsgHandler(fnId: string): void {
  for (let i = 0; i < _registerServerMsgHandlerList.length; i++) {
    const _fn = _registerServerMsgHandlerList[i]
    if ((_fn as any)._id === fnId) {
      _registerServerMsgHandlerList.splice(i, 1)
      return
    }
  }
}

export enum TcpTransferCmdCode {
  BLOCKING_CONNECTION,
  RESTORE_SERVER_ERR,
  RESTORE_SERVER_OK
}

export const serverMsgTransferFns = {
  registerServerMsgHandler,
  removeServerMsgHandler
}
