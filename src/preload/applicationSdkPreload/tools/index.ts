import { ipcRenderer } from 'electron'

export function tryJsonParseDataHandler(data: any): any {
  try {
    return JSON.parse(data)
  } catch (e) {
    return data
  }
}

const applicationPreloadIpcEventName = 'ipc-application-preload-with-promise'

export function sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  operationName: string,
  dataCallBack: ((data: any) => void) | undefined
): (eventName: string, ...data: any) => Promise<any> {
  return (eventName, ...data: any) => {
    return sendInvokeIpcEvent(operationName, eventName, dataCallBack, ...data)
  }
}

export async function sendInvokeIpcEvent(
  operationName: string,
  eventName: string,
  dataCallBack: ((data: any) => any) | undefined,
  ...data: any
): Promise<any> {
  const response = await ipcRenderer.invoke(
    applicationPreloadIpcEventName,
    operationName,
    eventName,
    ...data
  )

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
