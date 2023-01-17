import { electronAPI } from '@electron-toolkit/preload'
import { clipboard } from 'electron'
import { sendSyncIpcEventWrapperEventNameAndDataCallBack } from '../tools'

const sendSyncIpcEvent = sendSyncIpcEventWrapperEventNameAndDataCallBack('electron', undefined)

export const electron = {
  ...electronAPI,
  clipboard,
  isDev: sendSyncIpcEvent('isDev')
}
