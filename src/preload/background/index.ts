import { contextBridge } from 'electron'
import { loadDbApi } from '../applicationSdkPreload/db'
import {
  sendInvokeIpcEventWrapperEventNameAndDataCallBack,
  sendSyncIpcEventWrapperEventNameAndDataCallBack
} from '../applicationSdkPreload/tools'
import { id } from '../_commons/id'

const backgroundSdk = {
  id,
  db: loadDbApi(
    sendInvokeIpcEventWrapperEventNameAndDataCallBack,
    sendSyncIpcEventWrapperEventNameAndDataCallBack
  )
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('teamworkSDK', backgroundSdk)
} else {
  window['teamworkSDK'] = backgroundSdk
}
