import { BrowserView } from 'electron'
import AsyncLock from 'async-lock'

const lock = new AsyncLock()

const lockName = 'lock'

export class ApplicationViewManager {
  private static _instance = new ApplicationViewManager()
  public static get instance(): ApplicationViewManager {
    return this._instance
  }

  public _viewMap: { [key: string]: BrowserView } = {}

  private constructor() {
    //ignore
  }

  public createBrowserView(appName: string): Promise<BrowserView> {
    return lock.acquire(lockName, (done) => {
      if (this._viewMap[appName]) {
        done(undefined, this._viewMap[appName])
        return
      }

      new BrowserView()
    })
  }
}
