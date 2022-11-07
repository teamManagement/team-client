import { IpcMainEvent, IpcMainInvokeEvent } from 'electron'

/**
 * ipc异步处理事件包装
 * @param res 响应处理方法
 * @returns 相应处理方法
 */
export function ipcEventPromiseWrapper(
  res: (event: IpcMainInvokeEvent, ...data: any) => Promise<any>
): (event: IpcMainInvokeEvent, ...data: any) => Promise<any> {
  return async (event, ...reqData: any) => {
    try {
      let data = await res(event, ...reqData)
      if (data) {
        data = JSON.stringify(data)
      }

      return { error: false, data }
    } catch (e: any) {
      if (typeof e === 'string') {
        return { error: true, msg: e }
      }
      const err = e as Error
      return { error: true, msg: err.message }
    }
  }
}

/**
 * 包装同步ipc请求拦截器
 * @param reqHandler 请求handler
 * @returns 请求事件处理方法
 */
export function ipcEventSyncWrapper(
  reqHandler: (event: IpcMainEvent, ...data: any) => Promise<any> | any
): (event: IpcMainEvent, ...reqData: any) => void {
  return async (event, ...data) => {
    try {
      let res = reqHandler(event, ...data)
      if (res instanceof Promise) {
        res = await res
      }
      if (typeof res === 'undefined') {
        event.returnValue = { error: false }
        return
      }
      res = JSON.stringify(res)
      event.returnValue = { error: false, data: res }
    } catch (e) {
      if (typeof e === 'string') {
        return { error: true, msg: e }
      }
      const err = e as Error
      event.returnValue = { error: true, msg: err.message }
    }
    return
  }
}
