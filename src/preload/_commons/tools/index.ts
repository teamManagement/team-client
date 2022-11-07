import { ipcRenderer } from 'electron'

/**
 * 请求异步事件
 * @param ipcEventName 时间名称
 * @param operationName 操作对象名称
 * @param eventName 子事件名称
 * @param dataCallBack 数据回调
 * @param data 数据
 * @returns 响应
 */
export async function sendInvokeIpcEvent(
  ipcEventName: string,
  operationName: string,
  eventName: string,
  dataCallBack: ((data: any) => any) | undefined,
  ...data: any
): Promise<any> {
  const response = await ipcRenderer.invoke(ipcEventName, operationName, eventName, ...data)

  if (response.error) {
    throw new Error(response.msg || '未知的异常')
  }

  if (typeof response.data === 'undefined') {
    return undefined
  }

  const responseData = JSON.parse(response.data)
  if (dataCallBack) {
    return dataCallBack(responseData)
  }
  return responseData
}

/**
 * 尝试进行json转换
 * @param data 要解析的数据
 * @returns 解析之后的数据
 */
export function tryJsonParseDataHandler(data: any): any {
  try {
    return JSON.parse(data)
  } catch (e) {
    return data
  }
}

/**
 * 发送ipc同步事件
 * @param ipcEventName ipc事件名称
 * @param operationName 操作对象名称
 * @param eventName 子事件名称
 * @param dataCallBack 数据回调
 * @param data 要发送的数据
 * @returns 响应的数据
 */
export function sendSyncIpcEvent(
  ipcEventName: string,
  operationName: string,
  eventName: string,
  dataCallBack: ((data: any) => any) | undefined,
  ...data: any
): any {
  const response = ipcRenderer.sendSync(ipcEventName, operationName, eventName, ...data)
  if (response.error) {
    throw new Error(response.msg || '未知的异常')
  }

  if (typeof response.data === 'undefined') {
    return undefined
  }

  const responseData = JSON.parse(response.data)
  if (dataCallBack) {
    return dataCallBack(responseData)
  }
  return responseData
}
