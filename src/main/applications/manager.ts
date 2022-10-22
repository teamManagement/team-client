import { is, optimizer } from '@electron-toolkit/utils'
import path from 'path'
import {
  BrowserView,
  BrowserWindow,
  ipcMain,
  IpcMainInvokeEvent,
  Rectangle,
  session
} from 'electron'
import { PRELOAD_JS_INSIDE, PRELOAD_JS_NEW_WINDOW_OPEN } from '../consts'
import { SettingWindow } from '../windows/common'
import { CurrentInfo, WinNameEnum } from '../current'
import { uniqueId } from '../security/random'

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

const appErrorPageHashName = '/app/error'
let appErrorPageUrl = path.join(__dirname, '../renderer/index.html')
if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  appErrorPageUrl = process.env['ELECTRON_RENDERER_URL'] + '/#' + appErrorPageHashName
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
  SHOW_IN_ALERT = 'ipc-SHOW_ALERT_VIEW',
  /**
   * 销毁alert中的视图
   */
  DESTROY_ALERT = 'ipc-DESTROY_ALERT_VIEW'
}

let _viewMap: { [key: string]: BrowserView } = {}

function checkViewById(id?: string): BrowserView {
  if (!id) {
    throw new Error('缺失应用ID')
  }
  const view = _viewMap[id]
  if (!view) {
    throw new Error('应用视图未被创建')
  }
  return view
}

async function loadView(_event: IpcMainInvokeEvent, id: string, url: string): Promise<void> {
  const view = checkViewById(id)

  if (!url) {
    throw new Error('缺失应用路径')
  }

  try {
    await view.webContents.loadURL(url)
  } catch (e) {
    const errJsonStr = JSON.stringify(e)
    const errInfo = Buffer.from(errJsonStr, 'utf8').toString('base64url')
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      await view.webContents.loadURL(`${appErrorPageUrl}?errInfo=${errInfo}`)
    } else {
      await view.webContents.loadFile(appErrorPageUrl, {
        hash: appErrorPageHashName,
        query: {
          errInfo
        }
      })
    }
  }
}

function handlerBounds(
  bounds: Rectangle,
  defaultBounds: Rectangle,
  boundsOptions?: Rectangle & { widthOffset?: number; heightOffset?: number }
): void {
  if (boundsOptions) {
    if (typeof boundsOptions?.x !== 'undefined') {
      bounds.x = parseInt(boundsOptions.x + '')
    }

    if (typeof boundsOptions?.y !== 'undefined') {
      bounds.y = parseInt(boundsOptions.y + '')
    }

    if (typeof boundsOptions?.width !== 'undefined') {
      bounds.width = parseInt(boundsOptions.width + '')
    } else {
      bounds.width = parseInt(defaultBounds.width + '')
    }

    if (typeof boundsOptions?.height !== 'undefined') {
      bounds.height = parseInt(boundsOptions.height + '')
    } else {
      bounds.height = parseInt(defaultBounds.height + '')
    }

    if (typeof boundsOptions?.widthOffset !== 'undefined') {
      bounds.width += parseInt(boundsOptions.widthOffset + '')
    }

    if (typeof boundsOptions?.heightOffset !== 'undefined') {
      bounds.height += parseInt(boundsOptions.heightOffset + '')
    }
  }
}

async function showView(
  event: IpcMainInvokeEvent,
  id: string,
  url?: string,
  boundsOptions?: Rectangle & { widthOffset?: number; heightOffset?: number }
): Promise<void> {
  if (!url) {
    throw new Error('缺失应用路径')
  }

  const view = checkViewById(id)
  const _view = view as any
  if (_view._win) {
    const win: BrowserWindow = _view._win
    if (win.isMinimized()) {
      win.restore()
    }
    win.show()
    win.focus()
    return
  }

  const bw = BrowserWindow.fromWebContents(event.sender)
  if (!bw) {
    throw new Error('应用窗体不存在')
  }

  if (bw.getBrowserView() !== view) {
    bw.setBrowserView(view)
  }

  // const _view = view as any
  if (_view.originBounds) {
    view.setBounds(_view.originBounds)
    delete _view['originBounds']
    return
  }

  if (_view.loadOK) {
    return
  }

  const bwBounds = bw.getBounds()
  const bounds = view.getBounds()

  handlerBounds(bounds, bwBounds, boundsOptions)

  view.setBounds(bounds)
  view.setAutoResize({
    width: true,
    height: true
  })

  view.webContents.setWindowOpenHandler((details) => {
    view.webContents.send('ipc-url-new-window-handler', details.url)
    return { action: 'deny' }
  })
  try {
    await view.webContents.loadURL(url)
  } catch (e) {
    const errJsonStr = JSON.stringify(e)
    const errInfo = Buffer.from(errJsonStr, 'utf8').toString('base64url')
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      await view.webContents.loadURL(`${appErrorPageUrl}?errInfo=${errInfo}`)
    } else {
      await view.webContents.loadFile(appErrorPageUrl, {
        hash: appErrorPageHashName,
        query: {
          errInfo
        }
      })
    }
  }

  // 修复请求跨域问题
  view.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({
      requestHeaders: { referer: '*', ...details.requestHeaders }
    })
  })

  view.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        'Access-Control-Allow-Origin': ['*'],
        ...details.responseHeaders
      }
    })
  })

  _view.ok = true
  CurrentInfo.getWin(WinNameEnum.HOME)?.webContents.send(
    'ipc-app-open-status-notice',
    _view._appInfo,
    'open'
  )
}

async function showViewInAlert(_event: IpcMainInvokeEvent, id: string): Promise<void> {
  const view = checkViewById(id)
  const _view = view as any

  if (_view._win) {
    const win: BrowserWindow = _view._win
    if (win.isMinimized()) {
      win.restore()
    }
    win.show()
    win.focus()
    return
  }

  const appInfo: AppInfo = _view._appInfo
  if (!appInfo) {
    throw new Error('缺失应用信息')
  }

  await new Promise<void>((resolve, reject) => {
    SettingWindow(
      WinNameEnum.NONE,
      {
        minWidth: 800,
        minHeight: 550,
        width: 800,
        height: 550,
        frame: false,
        resizable: true,
        transparent: true,
        maximizable: false,
        minimizable: false
      },
      '/app/alert',
      false,
      {
        async readyToShowFn(win) {
          try {
            await new Promise<void>((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                reject('应用打开超时')
              }, 5000)
              const callbackId = 'ipc-appInfo-receive-' + uniqueId()
              ipcMain.once(callbackId, () => {
                clearTimeout(timeoutId)
                resolve()
              })
              win.webContents.send('ipc-appInfo-receive', callbackId, JSON.stringify(appInfo))
            })
            _view._win = win
            _view.noAlertBounds = view.getBounds()
          } catch (e) {
            win.destroy()
            reject(e as any)
            return
          }
          view.setBounds({ x: 6, y: 46, width: 788, height: 498 })
          view.setAutoResize({
            width: true,
            height: true
          })
          win.setBrowserView(view)
          win.show()
          resolve()
        }
      },
      true
    ).catch((e) => {
      reject(e)
    })
  })
}

async function hideView(_event: IpcMainInvokeEvent, id: string): Promise<void> {
  try {
    const view = checkViewById(id)
    const _view = view as any
    if (_view._win) {
      return
    }
    const bw = BrowserWindow.fromBrowserView(view)
    if (!bw) {
      return
    }

    const bv = bw.getBrowserView()
    if (!bv) {
      return
    }

    const bounds = bv.getBounds()
    if (!(bv as any).originBounds) {
      ;(bv as any).originBounds = bounds
    }

    bv.setBounds({ ...bounds, width: 0, height: 0 })
  } catch (e) {
    //nothing
  }
}

async function destroyView(_event: IpcMainInvokeEvent, id: string): Promise<void> {
  try {
    const view = checkViewById(id)
    const win = BrowserWindow.fromBrowserView(view)
    if (win) {
      win.removeBrowserView(view)
    }
    CurrentInfo.getWin(WinNameEnum.HOME)?.webContents.send(
      'ipc-app-open-status-notice',
      (view as any)._appInfo,
      'close'
    )
    ;(view.webContents as any).destroy()
    delete _viewMap[id]
  } catch (e) {
    //nothing
  }
}

async function destroyAlertView(_event: IpcMainInvokeEvent, id: string): Promise<void> {
  try {
    const view = checkViewById(id)
    const _view = view as any
    const win = _view._win as BrowserWindow
    if (win) {
      win.hide()
      win.destroy()
    }
    CurrentInfo.getWin(WinNameEnum.HOME)?.webContents.send(
      'ipc-app-open-status-notice',
      (view as any)._appInfo,
      'close'
    )
    ;(view.webContents as any).destroy()
    delete _viewMap[id]
  } catch (e) {
    //nothing
  }
}

async function createView(
  _event: IpcMainInvokeEvent,
  appInfo: AppInfo,
  loadInsidePreload?: boolean
): Promise<void> {
  if (!appInfo || !appInfo.id) {
    throw new Error('缺失应用信息')
  }

  if (_viewMap[appInfo.id]) {
    return
  }

  let preload: string | undefined = undefined
  if (loadInsidePreload) {
    preload = PRELOAD_JS_INSIDE
  }

  const appSession = session.fromPartition(appInfo.id)
  appSession.setPreloads([PRELOAD_JS_NEW_WINDOW_OPEN])

  const bv = new BrowserView({
    webPreferences: {
      preload: preload,
      sandbox: false,
      session: appSession
    }
  })
  ;(bv as any)._appInfo = appInfo
  _viewMap[appInfo.id] = bv

  if (is.dev) {
    optimizer.watchWindowShortcuts(bv as any)
  }
}

function eventPromiseWrapper(
  res: (event: IpcMainInvokeEvent, ...data: any) => Promise<any>
): (event: IpcMainInvokeEvent, ...data: any) => Promise<any> {
  return async (event, ...reqData: any) => {
    try {
      let data = await res(event, ...reqData)
      if (data) {
        data = JSON.stringify(data)
      }

      return { error: false, data }
    } catch (e: any) {
      const err = e as Error
      return { error: true, msg: err.message }
    }
  }
}

export function initApplicationViewManager(): void {
  ipcMain.handle(ApplicationViewEventNames.CREATE_VIEW, eventPromiseWrapper(createView))
  ipcMain.handle(ApplicationViewEventNames.DESTROY_VIEW, eventPromiseWrapper(destroyView))
  ipcMain.handle(ApplicationViewEventNames.LOAD_VIEW, eventPromiseWrapper(loadView))
  ipcMain.handle(ApplicationViewEventNames.SHOW_VIEW, eventPromiseWrapper(showView))
  ipcMain.handle(ApplicationViewEventNames.HIDE_VIEW, eventPromiseWrapper(hideView))
  ipcMain.handle(ApplicationViewEventNames.SHOW_IN_ALERT, eventPromiseWrapper(showViewInAlert))
  ipcMain.handle(ApplicationViewEventNames.DESTROY_ALERT, eventPromiseWrapper(destroyAlertView))
}

export function clearAllApplicationViews(): void {
  for (const k in _viewMap) {
    const webContents = _viewMap[k].webContents as any
    webContents.destroy()
    delete _viewMap[k]
  }
  _viewMap = {}
}
