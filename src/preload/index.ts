import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { proxyApi, TcpTransferCmdCode } from './proxy'
import { ContextMenu } from './electronProxy'

// Custom APIs for renderer
const api = {
  async login(username: string, password: string): Promise<void> {
    const response = await ipcRenderer.invoke('ipc-login', username, password)
    if (response.error) {
      throw response
    }

    return response
  }
}

enum AppType {
  REMOTE_WEB,
  LOCAL_WEB
}

enum IconType {
  URL,
  ICON_FONT
}

const apiMap: { [key: string]: any } = {
  electron: {
    ...electronAPI,
    ContextMenu: {
      get: ContextMenu.get,
      getById: ContextMenu.getById
    }
  },
  api: api,
  AppType: AppType,
  IconType: IconType,
  proxyApi: proxyApi,
  TcpTransferCmdCode: TcpTransferCmdCode
}

for (const k in apiMap) {
  if (process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld(k, apiMap[k])
    } catch (e) {
      console.error(e)
    }
  } else {
    window[k] = apiMap[k]
  }
}
