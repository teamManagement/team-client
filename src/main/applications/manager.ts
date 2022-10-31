import { is, optimizer } from '@electron-toolkit/utils'
import path from 'path'
import {
  BrowserView,
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  IpcMainInvokeEvent,
  Rectangle,
  session
} from 'electron'
import {
  PRELOAD_JS_APPLICATION_SDK,
  PRELOAD_JS_INSIDE,
  PRELOAD_JS_NEW_WINDOW_OPEN
} from '../consts'
import { SettingWindow } from '../windows/common'
import { CurrentInfo, WinNameEnum } from '../current'
import { ipcEventPromiseWrapper } from '../tools/ipc'

//#region APP相关接口
enum AppType {
  REMOTE_WEB,
  LOCAL_WEB
}

export enum IconType {
  URL,
  ICON_FONT
}

export interface AppInfo {
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
  loading?: boolean
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
  OPEN_APP_VIEW = 'ipc-APP_VIEW_OPEN_APP',
  /**
   * 展示视图
   */
  SHOW_VIEW = 'ipc-APP_VIEW_APP_SHOW',
  /**
   * 在alert中显示
   */
  SHOW_IN_ALERT = 'ipc-APP_VIEW_SHOW_IN_ALERT',
  /**
   * 在弹窗中显示通过当前打开的应用
   */
  SHOW_IN_ALERT_NOW_BY_OPENED = 'ipc-APP_VIEW_SHOW_IN_ALERT_BY_NOW_OPENED',
  /**
   * 隐藏视图
   */
  HIDE_VIEW = 'ipc-APP_VIEW_HIDE',
  /**
   * 销毁应用视图
   */
  DESTROY_VIEW = 'ipc-APP_VIEW_DESTROY',
  /**
   * 销毁alert中的视图
   */
  DESTROY_ALERT = 'ipc-APP_VIEW_DESTROY_IN_ALERT',
  /**
   * 挂起应用视图
   */
  HANG_UP = 'ip-APP_VIEW_HANG_UP',
  /**
   * 恢复应用视图
   */
  RESTORE = 'ip-APP_VIEW_RESTORE',
  /**
   * 已经打开的应用id列表
   */
  OPENED_APP_ID_LIST = 'ip-APP_VIEW_OPENED_ID_LIST_GET',
  /**
   * 隐藏最后打开的应用
   */
  HIDE_END_VIEW = 'ipc-APP_VIEW_HIDE_END_OPENED',
  /**
   * app弹出窗口可以进行展示
   */
  APP_INFO_GET_BY_CONTENT = 'ipc-APP_VIEW_INFO_GET_BY_CONTENT'
}

interface ViewInfo {
  view: BrowserView
  appInfo: AppInfo
  win?: BrowserWindow
  originBounds?: Rectangle
  loadOk?: boolean
  noAlertBounds?: Rectangle
}

let _wrapperEndOpenInfo: ViewInfo | undefined = undefined
const _viewMap: { [key: string]: ViewInfo } = {}

ipcMain.addListener(
  ApplicationViewEventNames.APP_INFO_GET_BY_CONTENT,
  async (event: IpcMainEvent) => {
    const _sender = event.sender as any
    if (!_sender._appInfo) {
      event.returnValue = undefined
      return
    }
    event.returnValue = JSON.stringify(_sender._appInfo)
  }
)

/**
 * 根据应用ID检查视图信息是否存在, 存在则返回视图信息
 * @param id 应用ID
 * @returns 应用视图信息
 */
function checkViewById(id?: string): ViewInfo {
  if (!id) {
    throw new Error('缺失应用ID')
  }
  const viewInfo = _viewMap[id]
  if (!viewInfo || !viewInfo.view) {
    throw new Error('应用视图未被创建')
  }
  return viewInfo
}

export function browserWindowListenViewResize(bw: BrowserWindow): void {
  bw.addListener('maximize', () => {
    setTimeout(() => {
      const view = bw.getBrowserView()
      if (!view) {
        return
      }

      view.setBounds(_calcViewBounds(bw, (bw.webContents as any)._inAlert))
    }, 10)
  })
}

function _calcViewBounds(bw: BrowserWindow, inAlert?: boolean): Rectangle {
  const borderOffset = 6
  const bwBounds = bw.getBounds()
  let x = 100
  let y = 82
  if (inAlert) {
    x = 0
    y = 42
  }

  x = x + borderOffset
  y = y + borderOffset

  return {
    x,
    y,
    width: bwBounds.width - x - borderOffset,
    height: bwBounds.height - y - borderOffset
  }
}

/**
 * 加载试图路径
 * @param bv 应用视图
 * @param url 视图页面加载路径
 */
async function loadView(bw: BrowserWindow, bv: BrowserView, url: string): Promise<void> {
  bv.webContents.addListener('dom-ready', () => {
    const _view = bv as any
    const _originBounds = _view._originBounds
    delete _view._originBounds
    if (_originBounds) {
      bv.setBounds(_originBounds)
    }
  })

  bv.webContents.setWindowOpenHandler((details) => {
    bv.webContents.send('ipc-url-new-window-handler', details.url)
    return { action: 'deny' }
  })

  // 修复请求跨域问题
  bv.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({
      requestHeaders: { referer: '*', ...details.requestHeaders }
    })
  })

  bv.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        'Access-Control-Allow-Origin': ['*'],
        ...details.responseHeaders
      }
    })
  })

  bw.setBrowserView(bv)
  bv.setAutoResize({
    width: true,
    height: true
  })
  bv.setBounds(_calcViewBounds(bw))
  try {
    if (!url) {
      throw { message: 'not found application view url' }
    }

    await new Promise<void>((resolve, reject) => {
      bv.webContents.addListener('dom-ready', () => {
        console.log('dom加载完成')
      })
      const timeoutId = setTimeout(() => {
        reject({ message: 'loading timeout' })
      }, 3000)
      bv.webContents.loadURL(url).then(() => {
        console.log('加载ok。。。')
        clearTimeout(timeoutId)
        resolve()
      })
    })
  } catch (e) {
    const errJsonStr = JSON.stringify(e)
    const errInfo = Buffer.from(errJsonStr, 'utf8').toString('base64url')
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      await bv.webContents.loadURL(`${appErrorPageUrl}?errInfo=${errInfo}`, {
        extraHeaders: 'pragma: no-cache\n'
      })
    } else {
      await bv.webContents.loadFile(appErrorPageUrl, {
        hash: appErrorPageHashName,
        query: {
          errInfo
        }
      })
    }
  }
}

/**
 * 打开一个应用视图
 * @param _event 主线程事件
 * @param appInfo 应用信息
 */
async function openAppView(event: IpcMainInvokeEvent, appInfo: AppInfo): Promise<void> {
  if (!appInfo || !appInfo.id) {
    throw new Error('缺失应用信息')
  }

  const bw = BrowserWindow.fromWebContents(event.sender)
  if (!bw) {
    throw new Error('缺失窗体信息')
  }

  if (_viewMap[appInfo.id]) {
    await showView(event, appInfo.id)
    return
  }

  let preload: string | undefined = undefined
  if (appInfo.inside) {
    preload = PRELOAD_JS_INSIDE
  }

  const appSession = session.fromPartition(appInfo.id)
  appSession.setPreloads([PRELOAD_JS_NEW_WINDOW_OPEN, PRELOAD_JS_APPLICATION_SDK])

  const bv = new BrowserView({
    webPreferences: {
      preload: preload,
      sandbox: false,
      session: appSession
    }
  })

  bv.setAutoResize({
    width: true,
    height: true
  })

  const viewInfo: ViewInfo = {
    view: bv,
    appInfo
  }
  _viewMap[appInfo.id] = viewInfo

  CurrentInfo.getWin(WinNameEnum.HOME)?.webContents.send(
    'ipc-app-open-status-notice',
    viewInfo.appInfo,
    'showTitle'
  )

  _wrapperEndOpenInfo = viewInfo
  viewInfo.appInfo.loading = true

  await loadView(bw, bv, appInfo.url)
  delete viewInfo.appInfo.loading
  ;(bv.webContents as any)._appInfo = appInfo
  if (is.dev) {
    optimizer.watchWindowShortcuts(bv as any)
  }
  CurrentInfo.getWin(WinNameEnum.HOME)?.webContents.send(
    'ipc-app-open-status-notice',
    viewInfo.appInfo,
    'open'
  )
}

/**
 * 展示应用视图
 * @param event 事件对象
 * @param id 应用ID
 */
async function showView(event: IpcMainInvokeEvent, id: string): Promise<void> {
  const viewInfo = checkViewById(id)
  const win = viewInfo.win
  if (win) {
    await showViewInAlert(event, id)
    return
  }

  const bw = BrowserWindow.fromWebContents(event.sender)
  if (!bw) {
    return
  }

  const view = viewInfo.view

  CurrentInfo.getWin(WinNameEnum.HOME)?.webContents.send(
    'ipc-app-open-status-notice',
    viewInfo.appInfo,
    'showTitle'
  )

  bw.setBrowserView(view)

  view.setBounds(_calcViewBounds(bw))

  _wrapperEndOpenInfo = viewInfo
  CurrentInfo.getWin(WinNameEnum.HOME)?.webContents.send(
    'ipc-app-open-status-notice',
    viewInfo.appInfo,
    'open'
  )
}

async function currentAppShowInAlert(event: IpcMainInvokeEvent): Promise<void> {
  if (!_wrapperEndOpenInfo) {
    return
  }

  await showViewInAlert(event, _wrapperEndOpenInfo.appInfo.id)
}

/**
 * 展示应用视图在弹窗
 * @param _event 事件对象
 * @param id 应用ID
 */
async function showViewInAlert(_event: IpcMainInvokeEvent, id: string): Promise<void> {
  const viewInfo = checkViewById(id)

  const win = viewInfo.win
  if (win) {
    if (win.isMinimized()) {
      win.restore()
    }
    win.show()
    win.focus()
    return
  }

  const appInfo: AppInfo = viewInfo.appInfo
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
          win.show()
        },
        closeFn() {
          destroyAlertView(null as any, viewInfo.appInfo.id)
        }
      },
      true,
      {
        _appInfo: viewInfo.appInfo,
        _inAlert: true
      }
    )
      .catch((e) => {
        reject(e)
      })
      .then((win) => {
        const view = viewInfo.view
        if (!win) {
          reject(new Error('窗体加载失败'))
          return
        }
        viewInfo.win = win

        browserWindowListenViewResize(win)
        BrowserWindow.fromBrowserView(view)?.removeBrowserView(view)
        view.setBounds(_calcViewBounds(win, true))
        win.setBrowserView(view)
        win.addListener('maximize', () => {
          setTimeout(() => {}, 20)
        })
        resolve()
      })
  })
}

async function hideView(_event: IpcMainInvokeEvent, id: string): Promise<void> {
  try {
    const viewInfo = checkViewById(id)
    if (viewInfo.win) {
      return
    }

    if (_wrapperEndOpenInfo === viewInfo) {
      _wrapperEndOpenInfo = undefined
    }

    const bw = BrowserWindow.fromBrowserView(viewInfo.view)
    if (!bw) {
      return
    }

    bw.removeBrowserView(viewInfo.view)
  } catch (e) {
    //nothing
  }
}

async function destroyView(_event: IpcMainInvokeEvent, id: string): Promise<void> {
  try {
    const viewInfo = checkViewById(id)
    const view = viewInfo.view
    if (viewInfo.win) {
      viewInfo.win.destroy()
    }
    const win = BrowserWindow.fromBrowserView(view)
    if (win) {
      win.removeBrowserView(view)
    }

    if (_wrapperEndOpenInfo === viewInfo) {
      _wrapperEndOpenInfo = undefined
    }

    ;(view.webContents as any).destroy()
    CurrentInfo.getWin(WinNameEnum.HOME)?.webContents.send(
      'ipc-app-open-status-notice',
      viewInfo.appInfo,
      'close'
    )
    delete _viewMap[id]
  } catch (e) {
    //nothing
  }
}

async function destroyAlertView(_event: IpcMainInvokeEvent, id: string): Promise<void> {
  try {
    const viewInfo = checkViewById(id)
    const win = viewInfo.win
    if (win) {
      if (!win.isDestroyed()) {
        win.hide()
        win.destroy()
      }
    }
    CurrentInfo.getWin(WinNameEnum.HOME)?.webContents.send(
      'ipc-app-open-status-notice',
      viewInfo.appInfo,
      'close'
    )
    ;(viewInfo.view.webContents as any).destroy()
    delete _viewMap[id]
  } catch (e) {
    //nothing
  }
}

function appOpenedIdListGet(event: IpcMainEvent): void {
  event.returnValue = Object.keys(_viewMap)
}

async function hangUp(): Promise<void> {
  if (!_wrapperEndOpenInfo || _wrapperEndOpenInfo.win) {
    return
  }

  BrowserWindow.fromBrowserView(_wrapperEndOpenInfo.view)?.removeBrowserView(
    _wrapperEndOpenInfo.view
  )
}

async function restore(event: IpcMainInvokeEvent): Promise<any> {
  if (!_wrapperEndOpenInfo) {
    return
  }

  await showView(event, _wrapperEndOpenInfo.appInfo.id)
  return _wrapperEndOpenInfo.appInfo
}

async function hideEndOpenedApp(event: IpcMainInvokeEvent): Promise<void> {
  if (!_wrapperEndOpenInfo) {
    return
  }

  hideView(event, _wrapperEndOpenInfo.appInfo.id)
}

export function initApplicationViewManager(): void {
  ipcMain.handle(ApplicationViewEventNames.OPEN_APP_VIEW, ipcEventPromiseWrapper(openAppView))
  ipcMain.handle(ApplicationViewEventNames.SHOW_VIEW, ipcEventPromiseWrapper(showView))
  ipcMain.handle(ApplicationViewEventNames.SHOW_IN_ALERT, ipcEventPromiseWrapper(showViewInAlert))
  ipcMain.handle(
    ApplicationViewEventNames.SHOW_IN_ALERT_NOW_BY_OPENED,
    ipcEventPromiseWrapper(currentAppShowInAlert)
  )
  ipcMain.handle(ApplicationViewEventNames.HIDE_VIEW, ipcEventPromiseWrapper(hideView))
  ipcMain.handle(ApplicationViewEventNames.HIDE_END_VIEW, ipcEventPromiseWrapper(hideEndOpenedApp))
  ipcMain.handle(ApplicationViewEventNames.DESTROY_VIEW, ipcEventPromiseWrapper(destroyView))
  ipcMain.handle(ApplicationViewEventNames.DESTROY_ALERT, ipcEventPromiseWrapper(destroyAlertView))
  ipcMain.handle(ApplicationViewEventNames.HANG_UP, ipcEventPromiseWrapper(hangUp))
  ipcMain.handle(ApplicationViewEventNames.RESTORE, ipcEventPromiseWrapper(restore))
  ipcMain.addListener(ApplicationViewEventNames.OPENED_APP_ID_LIST, appOpenedIdListGet)
}

export function clearAllApplicationViews(): void {
  for (const k in _viewMap) {
    const viewInfo = _viewMap[k]
    if (viewInfo.win) {
      viewInfo.win.destroy()
    }
    const webContents = viewInfo.view.webContents as any
    webContents.destroy()
    delete _viewMap[k]
  }
}
