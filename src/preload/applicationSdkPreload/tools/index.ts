import { sendInvokeIpcEvent, sendSyncIpcEvent } from '../../_commons/tools'

const applicationPreloadIpcEventName = 'ipc-application-preload-with-promise'
const applicationPreloadIpcSyncEventName = 'ipc-application-preload-with-sync'

export function sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  operationName: string,
  dataCallBack: ((data: any) => void) | undefined
): (eventName: string, ...data: any) => Promise<any> {
  return (eventName, ...data: any) => {
    return sendInvokeIpcEvent(
      applicationPreloadIpcEventName,
      operationName,
      eventName,
      dataCallBack,
      ...data
    )
  }
}

export function sendSyncIpcEventWrapperEventNameAndDataCallBack(
  operationName: string,
  dataCallBack: ((data: any) => void) | undefined
): (eventName: string, ...data: any) => any {
  return (eventName, ...data: any) => {
    return sendSyncIpcEvent(
      applicationPreloadIpcSyncEventName,
      operationName,
      eventName,
      dataCallBack,
      ...data
    )
  }
}

// export async function sendInvokeIpcEvent(
//   operationName: string,
//   eventName: string,
//   dataCallBack: ((data: any) => any) | undefined,
//   ...data: any
// ): Promise<any> {
//   const response = await ipcRenderer.invoke(
//     applicationPreloadIpcEventName,
//     operationName,
//     eventName,
//     ...data
//   )

//   if (response.error) {
//     throw new Error(response.msg || '未知的异常')
//   }

//   if (typeof response.data === 'undefined') {
//     return undefined
//   }

//   const responseData = JSON.parse(response.data)
//   if (dataCallBack) {
//     return dataCallBack(responseData)
//   }
//   return responseData
// }
