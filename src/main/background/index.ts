import { BrowserWindow } from 'electron'
import { AppInfo } from '../sdk/insideSdk/applications'
import AsyncLock from 'async-lock'
import { sendHttpRequestToLocalServer } from '../tools'

const lock = new AsyncLock()
const _lockName = 'lock'

const backgroundWinContentUrl = 'about:blank'

export interface BackgroundAppServiceManagerInterface {
  join(appInfo: AppInfo): void
  leave(appId: string): void
}

interface AppWinInfo {
  appInfo: AppInfo
  win: BrowserWindow
}

interface AppWinMap {
  [key: string]: AppWinInfo
}

class BackgroundAppServiceManager implements BackgroundAppServiceManagerInterface {
  private _appWinMap: AppWinMap = {}

  join(appInfo: AppInfo): void {
    if (!appInfo) {
      throw new Error('未知的应用信息')
    }

    if (typeof appInfo.id !== 'string' || appInfo.id.length === 0) {
      throw new Error('缺失应用ID')
    }

    lock.acquire(_lockName, (done) => {
      try {
        if (this._appWinMap[appInfo.id]) {
          return
        }

        sendHttpRequestToLocalServer('')

        const win = new BrowserWindow({
          width: 0,
          height: 0,
          show: false,
          webPreferences: {
            sandbox: false
            // preload:
          }
        })
      } finally {
        done()
      }
    })
  }
  leave(appId: string): void {
    throw new Error('Method not implemented.')
  }
}

export const backgroundAppServiceManager: BackgroundAppServiceManagerInterface =
  new BackgroundAppServiceManager()
