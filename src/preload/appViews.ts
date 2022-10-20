import { ipcRenderer } from 'electron'

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
  HIDE_VIEW = 'ipc-HIDE_VIEW'
}

export class ApplicationView {
  private static _openedMap: { [key: string]: ApplicationView } = {}
  private static _openedIdList: string[] = []
  private static _appOpenStatusNoticeFn: ((appId: string, status: 'open' | 'close') => void)[] = []
  private static _endOpenId: string | undefined = undefined

  public static async hangUp(): Promise<void> {
    // eslint-disable-next-line no-debugger
    debugger
    if (!ApplicationView._endOpenId) {
      return
    }

    const av = ApplicationView.getApplicationViewById(ApplicationView._endOpenId)
    if (!av) {
      return
    }

    await av.hide()
  }

  public static async restore(): Promise<void> {
    if (!ApplicationView._endOpenId) {
      return
    }

    const av = ApplicationView.getApplicationViewById(ApplicationView._endOpenId)
    if (!av) {
      return
    }

    await av.show()
  }

  public static getOpenedIdList(): string[] {
    // eslint-disable-next-line no-debugger
    debugger
    return ApplicationView._openedIdList
  }

  public static async openApp(id: string, url: string): Promise<ApplicationView> {
    let view = ApplicationView._openedMap[id]
    if (view) {
      return view
    }

    view = new ApplicationView(id, url)
    await view.init()
    await view.load()

    return view
  }

  public static getApplicationViewById(id: string): ApplicationView | undefined {
    return this._openedMap[id]
  }

  public static async closeApp(id: string): Promise<void> {
    const view = this._openedMap[id]
    if (!view) {
      return
    }
    view.destroy()
  }

  public static listenOpenStatusNotice(fn: (id: string, status: 'open' | 'close') => void): void {
    for (const _fn of ApplicationView._appOpenStatusNoticeFn) {
      if (_fn === fn) {
        return
      }
    }

    ApplicationView._appOpenStatusNoticeFn.push(fn)
  }

  public static removeListenOpenStatusNotice(
    fn: (id: string, status: 'open' | 'close') => void
  ): void {
    for (let i = 0; i < ApplicationView._appOpenStatusNoticeFn.length; i++) {
      if (ApplicationView._appOpenStatusNoticeFn[i] === fn) {
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

  public static async showOrLoad(
    id: string,
    url: string,
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
      if (await ApplicationView.show(id)) {
        return true
      }

      await ApplicationView.openApp(id, url)

      return await ApplicationView.show(id, bounds)
    } catch (e) {
      return false
    }
  }

  public constructor(private _id: string, private _url: string) {
    this._ipcInvoke = this._ipcInvoke.bind(this)
    this.init = this.init.bind(this)
    this.destroy = this.destroy.bind(this)
    this.hide = this.hide.bind(this)
    this.load = this.load.bind(this)
    this.show = this.show.bind(this)
  }

  private _noticeStatus(status: 'open' | 'close'): void {
    for (const fn of ApplicationView._appOpenStatusNoticeFn) {
      fn(this._id, status)
    }
  }

  private async _ipcInvoke(eventName: string, ...data: any): Promise<any> {
    const res = await ipcRenderer.invoke(eventName, this._id, ...data)
    if (res.error) {
      throw res.msg
    }
    return res.data
  }

  public async init(): Promise<void> {
    if (ApplicationView._openedMap[this._id]) {
      return
    }

    await this._ipcInvoke(ApplicationViewEventNames.CREATE_VIEW)
    ApplicationView._openedIdList.push(this._id)
    ApplicationView._openedMap[this._id] = this
    this._noticeStatus('open')
  }

  public async destroy(): Promise<void> {
    await this._ipcInvoke(ApplicationViewEventNames.DESTROY_VIEW)
    delete ApplicationView._openedMap[this._id]
    const index = ApplicationView._openedIdList.indexOf(this._id)
    if (index !== -1) {
      ApplicationView._openedIdList.splice(index, 1)
    }
    this._noticeStatus('close')
  }

  public async hide(): Promise<void> {
    await this._ipcInvoke(ApplicationViewEventNames.HIDE_VIEW)
  }

  public async load(): Promise<void> {
    await this._ipcInvoke(ApplicationViewEventNames.LOAD_VIEW, this._url)
  }

  public async show(data?: {
    x: number
    y: number
    width?: number
    widthOffset: number
    height?: number
    heightOffset: number
  }): Promise<void> {
    console.log('进入...')
    ApplicationView._endOpenId = this._id
    await this._ipcInvoke(ApplicationViewEventNames.SHOW_VIEW, data)
  }
}
