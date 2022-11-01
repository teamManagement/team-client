import { contextBridge, ipcRenderer } from 'electron'
import { cache } from './cache'
import { currentInfo } from './current'
import { exec } from './exec'
import { proxy } from './proxy'
import { store } from './store'

const teamworkSDK = {
  store,
  exec,
  proxy,
  cache,
  currentInfo
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('teamworkSDK', teamworkSDK)
} else {
  window['teamworkSDK'] = teamworkSDK
}
