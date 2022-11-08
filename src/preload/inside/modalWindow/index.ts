import { sendSyncIpcEventWrapperEventNameAndDataCallBack } from '../tools'

const sendSyncIpcEvent = sendSyncIpcEventWrapperEventNameAndDataCallBack('modalWindow', undefined)

export const modalWindow = {
  showUserinfo(): void {
    return sendSyncIpcEvent('showUserinfo')
  }
}
