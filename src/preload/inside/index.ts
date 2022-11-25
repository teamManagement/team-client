import { contextBridge } from 'electron'
import { id } from '../_commons/id'
import { electron } from './electron'
import { api } from './api'
import { TcpTransferCmdCode } from './api/serverMsgTransfer'
import { currentWindow } from './currentWindow'
import { applications } from './applications'
import { contextmenu } from '../_commons/contextmenu'
import { modalWindow } from './modalWindow'
import '../applicationSdkPreload'
import { remoteCache } from './remoteCache'

// Custom APIs for renderer
// const api = {
//   async login(username: string, password: string): Promise<void> {
//     const response = await ipcRenderer.invoke('ipc-login', username, password)
//     if (response.error) {
//       throw response
//     }

//     return response
//   },
//   contextmenu
// }

enum AppType {
  REMOTE_WEB,
  LOCAL_WEB
}

enum IconType {
  URL,
  ICON_FONT
}

// const apiMap: { [key: string]: any } = {
//   id,
//   electron: {
//     ...electronAPI,
//     ContextMenu: {
//       get: ContextMenu.get,
//       getById: ContextMenu.getById
//     }
//   },
//   api,
//   AppType: AppType,
//   IconType: IconType,
//   proxyApi: proxyApi,
//   TcpTransferCmdCode,
//   app: {
//     getOpenedIdList,
//     listenStatusNotice,
//     removeStatusNotice,
//     openApp,
//     showById,
//     showInAlertById,
//     currentShowInAlert,
//     hideById,
//     hangUp,
//     restore,
//     hideEndOpenedApp,
//     destroyById,
//     destroyAlertById,
//     getCurrentAppInfo,
//     install,
//     uninstall
//   },
//   currentWindow,
//   modalWindow,
//   logout(): void {
//     ipcRenderer.send('ipc_LOGOUT')
//   }
// }

const apiMap = {
  teamworkInsideSdk: {
    electron,
    id,
    api,
    currentWindow,
    applications,
    contextmenu,
    modalWindow,
    remoteCache
  },
  TcpTransferCmdCode,
  AppType,
  IconType
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
