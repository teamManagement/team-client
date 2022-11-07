import { contextBridge } from 'electron'
import { contextmenu } from '../_commons/contextmenu'
import { cache } from './cache'
import { current } from './current'
import { exec } from './exec'
import { hosts } from './hosts'
import { proxy } from './proxy'
import { store } from './store'

const teamworkSDK = {
  store,
  exec,
  proxy,
  cache,
  hosts,
  current,
  contextmenu
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('teamworkSDK', teamworkSDK)
} else {
  window['teamworkSDK'] = teamworkSDK
}
