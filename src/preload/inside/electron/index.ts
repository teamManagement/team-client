import { electronAPI } from '@electron-toolkit/preload'
import { sendSyncIpcEventWrapperEventNameAndDataCallBack } from '../tools'

const sendSyncIpcEvent = sendSyncIpcEventWrapperEventNameAndDataCallBack('electron', undefined)

export const electron = {
  ...electronAPI,
  isDev: sendSyncIpcEvent('isDev')
}
