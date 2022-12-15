import { contextBridge } from 'electron'
import { contextmenu } from '../_commons/contextmenu'
import { id } from '../_commons/id'
import { cache } from './cache'
import { current } from './current'
import { loadDbApi } from './db'
import { dialog } from './dialog'
import { download } from './download'
import { exec } from './exec'
import { hosts } from './hosts'
import { notification } from './notification'
import { proxy } from './proxy'
import { store } from './store'
import {
  sendInvokeIpcEventWrapperEventNameAndDataCallBack,
  sendSyncIpcEventWrapperEventNameAndDataCallBack
} from './tools'

const teamworkSDK = {
  id,
  store,
  exec,
  proxy,
  cache,
  hosts,
  current,
  contextmenu,
  db: loadDbApi(
    sendInvokeIpcEventWrapperEventNameAndDataCallBack,
    sendSyncIpcEventWrapperEventNameAndDataCallBack
  ),
  dialog,
  download,
  notification
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('teamworkSDK', teamworkSDK)
} else {
  window['teamworkSDK'] = teamworkSDK
}
