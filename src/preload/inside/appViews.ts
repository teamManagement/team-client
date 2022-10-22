import { ipcRenderer } from 'electron'

//#region APP相关接口
enum AppType {
  REMOTE_WEB,
  LOCAL_WEB
}

enum IconType {
  URL,
  ICON_FONT
}

interface AppInfo {
  id: string
  name: string
  inside: boolean
  type: AppType
  remoteSiteUrl: string
  url: string
  icon: string
  iconType: IconType
  desc: string
  shortDesc: string
  version: string
}
//#endregion

let _currentAppInfo: any = undefined

console.log('监听。。。')
const eventAppInfoReceive = 'ipc-appInfo-receive'
ipcRenderer.once(eventAppInfoReceive, (_event, callbackId: string, appInfo: string) => {
  console.log('监听进入...')
  // eslint-disable-next-line no-debugger
  debugger
  _currentAppInfo = JSON.parse(appInfo)
  ipcRenderer.send(callbackId)
})

export function getCurrentAppInfo<T>(): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let num = 0
    const intervalId = setInterval(() => {
      if (num > 100) {
        clearInterval(intervalId)
        reject(new Error('应用信息获取超时'))
        return
      }

      if (_currentAppInfo) {
        clearInterval(intervalId)
        resolve(_currentAppInfo)
        return
      }

      num += 1
    }, 50)
  })
}

enum ApplicationViewEventNames {
  /**
   * 创建应用展示视图
   */
  CREATE_VIEW = 'ipc-APPLICATION_CREATE_VIEW',
  /**
   * 销毁应用视图
   */
  DESTROY_VIEW = 'ipc-APPLICATION_DESTROY_VIEW',
  /**
   * 加载视图
   */
  LOAD_VIEW = 'ipc-LOAD_VIEW',
  /**
   * 展示视图
   */
  SHOW_VIEW = 'ipc-SHOW_VIEW',
  /**
   * 隐藏视图
   */
  HIDE_VIEW = 'ipc-HIDE_VIEW',
  /**
   * 在alert中显示
   */
  SHOW_IN_ALERT = 'ipc-SHOW_ALERT_VIEW'
}

export class ApplicationView {
  private static _openedMap: { [key: string]: ApplicationView } = {}
  private static _openedIdList: string[] = []
  private static _appOpenStatusNoticeFn: ((appId: string, status: 'open' | 'close') => void)[] = []
  private static _endOpenAppInfo: AppInfo | undefined = undefined

  public static async hangUp(): Promise<void> {
    if (!ApplicationView._endOpenAppInfo) {
      return
    }

    const av = ApplicationView.getApplicationViewById(ApplicationView._endOpenAppInfo.id)
    if (!av) {
      return
    }

    await av.hide()
  }

  public static async restore(): Promise<AppInfo | undefined> {
    if (!ApplicationView._endOpenAppInfo) {
      return undefined
    }

    const av = ApplicationView.getApplicationViewById(ApplicationView._endOpenAppInfo.id)
    if (!av) {
      return undefined
    }

    await av.show()
    return ApplicationView._endOpenAppInfo
  }

  public static getOpenedIdList(): string[] {
    return ApplicationView._openedIdList
  }

  public static async openApp(
    appInfo: AppInfo,
    bounds?: {
      x: number
      y: number
      width?: number
      widthOffset: number
      height?: number
      heightOffset: number
    },
    loadInsidePreload?: boolean
  ): Promise<boolean> {
    const id = appInfo.id
    if (await ApplicationView.show(id)) {
      return true
    }

    const view = new ApplicationView(appInfo, loadInsidePreload)
    await view.init()
    await view.show(bounds)
    return true
  }

  public static getApplicationViewById(id: string): ApplicationView | undefined {
    return this._openedMap[id]
  }

  public static async closeApp(id: string): Promise<void> {
    const view = ApplicationView._openedMap[id]
    if (!view) {
      return
    }
    await view.destroy()
  }

  public static listenOpenStatusNotice(
    id: string,
    fn: (id: string, status: 'open' | 'close') => void
  ): void {
    for (const _fn of ApplicationView._appOpenStatusNoticeFn) {
      if ((_fn as any)._id === (fn as any)._id) {
        return
      }
    }

    ;(fn as any)._id = id
    ApplicationView._appOpenStatusNoticeFn.push(fn)
  }

  public static removeListenOpenStatusNotice(id: string): void {
    for (let i = 0; i < ApplicationView._appOpenStatusNoticeFn.length; i++) {
      if ((ApplicationView._appOpenStatusNoticeFn[i] as any)._id === id) {
        ApplicationView._appOpenStatusNoticeFn.splice(i, 1)
        return
      }
    }
  }

  public static async show(
    id: string,
    bounds?: {
      x: number
      y: number
      width?: number
      widthOffset: number
      height?: number
      heightOffset: number
    }
  ): Promise<boolean> {
    try {
      const view = ApplicationView._openedMap[id]
      if (!view) {
        return false
      }

      await view.show(bounds)
      return true
    } catch (e) {
      return false
    }
  }

  public static async showInAlert(
    id: string,
    data?: {
      x: number
      y: number
      width?: number
      widthOffset: number
      height?: number
      heightOffset: number
    }
  ): Promise<void> {
    const view = ApplicationView._openedMap[id]
    if (!view) {
      throw new Error('应用弹出失败')
    }

    await view.showInAlert(data)
  }

  private _url: string

  public constructor(private _appInfo: AppInfo, private _loadInsidePreload?: boolean) {
    this._ipcInvoke = this._ipcInvoke.bind(this)
    this.init = this.init.bind(this)
    this.destroy = this.destroy.bind(this)
    this.hide = this.hide.bind(this)
    // this.load = this.load.bind(this)
    this.show = this.show.bind(this)
    this.showInAlert = this.showInAlert.bind(this)
    this._url = this._appInfo.url
  }

  private _noticeStatus(status: 'open' | 'close'): void {
    for (const fn of ApplicationView._appOpenStatusNoticeFn) {
      fn(this._appInfo.id, status)
    }
  }

  private async _ipcInvoke(eventName: string, sendAppInfo: boolean, ...data: any): Promise<any> {
    const sendData = sendAppInfo ? this._appInfo : this._appInfo.id
    const res = await ipcRenderer.invoke(eventName, sendData, ...data)
    if (res.error) {
      throw res.msg
    }
    return res.data
  }

  public async init(): Promise<void> {
    if (ApplicationView._openedMap[this._appInfo.id]) {
      return
    }

    await this._ipcInvoke(ApplicationViewEventNames.CREATE_VIEW, true, this._loadInsidePreload)
  }

  public async destroy(): Promise<void> {
    await this._ipcInvoke(ApplicationViewEventNames.DESTROY_VIEW, false)
    delete ApplicationView._openedMap[this._appInfo.id]
    const index = ApplicationView._openedIdList.indexOf(this._appInfo.id)
    if (index !== -1) {
      ApplicationView._openedIdList.splice(index, 1)
    }
    this._noticeStatus('close')
  }

  public async hide(): Promise<void> {
    await this._ipcInvoke(ApplicationViewEventNames.HIDE_VIEW, false)
  }

  public async show(data?: {
    x: number
    y: number
    width?: number
    widthOffset: number
    height?: number
    heightOffset: number
  }): Promise<void> {
    ApplicationView._endOpenAppInfo = this._appInfo
    await this._ipcInvoke(ApplicationViewEventNames.SHOW_VIEW, false, this._url, data)
    if (ApplicationView._openedIdList.includes(this._appInfo.id)) {
      return
    }
    ApplicationView._openedIdList.push(this._appInfo.id)
    ApplicationView._openedMap[this._appInfo.id] = this
    this._noticeStatus('open')
  }

  public async showInAlert(data?: {
    x: number
    y: number
    width?: number
    widthOffset: number
    height?: number
    heightOffset: number
  }): Promise<void> {
    await this._ipcInvoke(ApplicationViewEventNames.SHOW_IN_ALERT, false, data)
  }
}
