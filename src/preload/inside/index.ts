import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { proxyApi, TcpTransferCmdCode } from './proxy'
import { ContextMenu } from './electronProxy'
import { ApplicationView, getCurrentAppInfo } from './appViews'

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
  TcpTransferCmdCode,
  ApplicationView: function (appInfo: any) {
    return new ApplicationView(appInfo)
  },
  app: {
    getOpenedIdList: ApplicationView.getOpenedIdList,
    getApplicationViewById: ApplicationView.getApplicationViewById,
    openApp: ApplicationView.openApp,
    closeApp: ApplicationView.closeApp,
    listenOpenStatusNotice: ApplicationView.listenOpenStatusNotice,
    removeListenOpenStatusNotice: ApplicationView.removeListenOpenStatusNotice,
    show: ApplicationView.show,
    // showOrLoad: ApplicationView.showOrLoad,
    hangUp: ApplicationView.hangUp,
    restore: ApplicationView.restore,
    showInAlert: ApplicationView.showInAlert,
    getCurrentAppInfo
  }
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
