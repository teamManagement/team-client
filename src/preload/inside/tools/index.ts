import { sendInvokeIpcEvent, sendSyncIpcEvent } from '../../_commons/tools'

const insideSdkIpcEventName = 'ipc-inside-sdk-with-promise'
const insideSdkSyncEventName = 'ipc-inside-sdk-with-sync'
export function sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  operationName: string,
  dataCallBack: ((data: any) => void) | undefined
): (eventName: string, ...data: any) => Promise<any> {
  return (eventName, ...data: any) => {
    return sendInvokeIpcEvent(
      insideSdkIpcEventName,
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
    return sendSyncIpcEvent(insideSdkSyncEventName, operationName, eventName, dataCallBack, ...data)
  }
}
