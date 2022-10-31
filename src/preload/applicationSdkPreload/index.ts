import { contextBridge } from 'electron'
import { exec } from './exec'
import { proxy } from './proxy'
import { store } from './store'

const teamworkSDK = {
  store,
  exec,
  proxy
}

console.log('preload loading ...')
if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('teamworkSDK', teamworkSDK)
} else {
  window['teamworkSDK'] = teamworkSDK
}
