import { is } from '@electron-toolkit/utils'
import {
  BrowserView,
  BrowserWindow,
  IpcMainEvent,
  IpcMainInvokeEvent,
  Rectangle,
  session
} from 'electron'
import logs from 'electron-log'
import path from 'path'
import { SdkHandlerParam } from '../..'
import {
  PRELOAD_JS_APPLICATION_SDK,
  PRELOAD_JS_INSIDE,
  PRELOAD_JS_NEW_WINDOW_OPEN
} from '../../../consts'
import { CurrentInfo, WinNameEnum } from '../../../current'
import { sendHttpRequestToLocalServer } from '../../../tools'
import { SettingWindow } from '../../../windows/common'
import { createDatabase, Database } from '../../appSdk/db'

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
  debugging?: boolean
  db: Database
}
//#endregion

/**
 * 应用视图信息
 */
interface ViewInfo {
  /**
   * 应用视图
   */
  view: BrowserView
  /**
   * 应用信息
   */
  appInfo: AppInfo
  /**
   * 应用弹出显示时的窗体信息
   */
  win?: BrowserWindow
  /**
   * 应用弹出时的原始边界大小
   */
  originBounds?: Rectangle
  /**
   * 是否显示完毕
   */
  loadOk?: boolean
  /**
   * 没有弹出时的边界信息
   */
  noAlertBounds?: Rectangle
}

//#region 加载错误页面
const appErrorPageHashName = '/app/error'
let appErrorPageUrl = path.join(__dirname, '../renderer/index.html')
if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  appErrorPageUrl = process.env['ELECTRON_RENDERER_URL'] + '/#' + appErrorPageHashName
}
//#endregion

/**
 * 包装最后打开的应用信息
 */
let _wrapperEndOpenInfo: ViewInfo | undefined = undefined

/**
 * 视图map, key: 应用Id, value: 视图信息
 */
const _viewMap: { [key: string]: ViewInfo } = {}

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

/**
 * 计算应用视图边界
 * @param bw 应用视图
 * @param inAlert 是否弹出显示
 * @returns 边界
 */
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
async function loadView(bw: BrowserWindow, bv: BrowserView, appInfo: AppInfo): Promise<void> {
  const url = appInfo.url
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
  bv.webContents.addListener('destroyed', () => {
    appInfo.db && appInfo.db.destroy()
    logs.debug(`应用: ${appInfo.name} 被销毁, 关闭应用数据存储成功`)
  })
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
      }, 30000)
      bv.webContents
        .loadURL(url)
        .then(() => {
          console.log('加载ok。。。')
          clearTimeout(timeoutId)
          resolve()
        })
        .catch((e) => {
          clearTimeout(timeoutId)
          reject(e)
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
 * 展示应用视图
 * @param event 事件对象
 * @param id 应用ID
 */
async function showById(event: IpcMainInvokeEvent, id: string): Promise<void> {
  const viewInfo = checkViewById(id)
  const win = viewInfo.win
  if (win) {
    await showInAlertById(event, id)
    return
  }

  const bw = BrowserWindow.fromWebContents(event.sender)
  if (!bw) {
    return
  }

  const view = viewInfo.view

  CurrentInfo.getWin(WinNameEnum.HOME)?.webContents.send(
    'ipc-app-open-status-notice',
    { ...viewInfo.appInfo, db: undefined },
    'showTitle'
  )

  bw.setBrowserView(view)

  view.setBounds(_calcViewBounds(bw))

  _wrapperEndOpenInfo = viewInfo
  CurrentInfo.getWin(WinNameEnum.HOME)?.webContents.send(
    'ipc-app-open-status-notice',
    { ...viewInfo.appInfo, db: undefined },
    'open'
  )
}

/**
 * 打开一个应用视图
 * @param _event 主线程事件
 * @param appInfo 应用信息
 */
async function openApp(event: IpcMainInvokeEvent, appInfo: AppInfo): Promise<void> {
  if (!appInfo || !appInfo.id) {
    throw new Error('缺失应用信息')
  }

  const bw = BrowserWindow.fromWebContents(event.sender)
  if (!bw) {
    throw new Error('缺失窗体信息')
  }

  if (_viewMap[appInfo.id]) {
    await showById(event, appInfo.id)
    return
  }

  appInfo.db = await createDatabase(appInfo)

  let preload: string | undefined = undefined
  const appSession = session.fromPartition(appInfo.id)
  if (appInfo.inside) {
    preload = PRELOAD_JS_INSIDE
  } else {
    preload = PRELOAD_JS_APPLICATION_SDK
  }

  //     appSession.setPreloads([PRELOAD_JS_NEW_WINDOW_OPEN, PRELOAD_JS_APPLICATION_SDK])
  appSession.setPreloads([PRELOAD_JS_NEW_WINDOW_OPEN])

  const bv = new BrowserView({
    webPreferences: {
      preload,
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
    { ...viewInfo.appInfo, db: undefined },
    'showTitle'
  )

  _wrapperEndOpenInfo = viewInfo
  viewInfo.appInfo.loading = true

  // 将对象信息attach动作提前，解决页面中js加载过快但dom元素加载过慢导致的SDK无法获取信息的bug
  ;(bv.webContents as any)._appInfo = appInfo
  await loadView(bw, bv, appInfo)
  delete viewInfo.appInfo.loading
  // if (is.dev || appInfo.debugging) {
  //   optimizer.watchWindowShortcuts(bv as any)
  // }
  CurrentInfo.getWin(WinNameEnum.HOME)?.webContents.send(
    'ipc-app-open-status-notice',
    { ...viewInfo.appInfo, db: undefined },
    'open'
  )
}

/**
 * 当前应用视图在弹窗中显示
 * @param event 事件
 */
async function currentShowInAlert(event: IpcMainInvokeEvent): Promise<void> {
  if (!_wrapperEndOpenInfo) {
    return
  }

  await showInAlertById(event, _wrapperEndOpenInfo.appInfo.id)
}

/**
 * 展示应用视图在弹窗
 * @param _event 事件对象
 * @param id 应用ID
 */
async function showInAlertById(_event: IpcMainInvokeEvent, id: string): Promise<void> {
  const viewInfo = checkViewById(id)

  if (_wrapperEndOpenInfo === viewInfo) {
    _wrapperEndOpenInfo = undefined
  }

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
          destroyAlertById(null as any, viewInfo.appInfo.id)
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

async function hideById(_event: IpcMainInvokeEvent, id: string): Promise<void> {
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

async function destroyById(_event: IpcMainInvokeEvent, id: string): Promise<void> {
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
      { ...viewInfo.appInfo, db: undefined },
      'close'
    )
    delete _viewMap[id]
  } catch (e) {
    //nothing
  }
}

async function destroyAlertById(_event: IpcMainInvokeEvent, id: string): Promise<void> {
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
      { ...viewInfo.appInfo, db: undefined },
      'close'
    )
    ;(viewInfo.view.webContents as any).destroy()
    delete _viewMap[id]
  } catch (e) {
    //nothing
  }
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

  await showById(event, _wrapperEndOpenInfo.appInfo.id)
  return _wrapperEndOpenInfo.appInfo
}

async function hideEndOpenedApp(event: IpcMainInvokeEvent): Promise<void> {
  if (!_wrapperEndOpenInfo) {
    return
  }

  hideById(event, _wrapperEndOpenInfo.appInfo.id)
}

async function _callLocalServerAndFlushDesktop(
  appId: string,
  url: string,
  jsonData?: any
): Promise<void> {
  if (!appId) {
    throw new Error('未知的应用ID')
  }
  await sendHttpRequestToLocalServer(url, {
    timeout: -1,
    jsonData
  })
  CurrentInfo.getWin(WinNameEnum.HOME)?.webContents.send('desktop-refresh')
  return
}

const applicationsHandlers = {
  openApp,
  showById,
  showInAlertById,
  currentShowInAlert,
  hideById,
  hangUp,
  restore,
  hideEndOpenedApp,
  destroyById,
  destroyAlertById,
  install(_event: IpcMainInvokeEvent, appId: string): Promise<void> {
    return _callLocalServerAndFlushDesktop(appId, '/app/install/' + appId)
  },
  uninstall(_event: IpcMainInvokeEvent, appId: string): Promise<void> {
    return _callLocalServerAndFlushDesktop(appId, '/app/uninstall/' + appId)
  },
  installWithDebug(_event: IpcMainInvokeEvent, appInfo: AppInfo): Promise<void> {
    return _callLocalServerAndFlushDesktop(appInfo.id, '/app/debug/install', appInfo)
  },
  uninstallWithDebug(_event: IpcMainInvokeEvent, appId: string): Promise<void> {
    return _callLocalServerAndFlushDesktop(appId, '/app/debug/uninstall/' + appId)
  }
}

/**
 * applications事件处理
 * @param eventName 事件名称
 * @param data 数据
 * @returns 响应数据
 */
export function _applicationsHandler(
  event: IpcMainInvokeEvent,
  eventName: string,
  ...data: any
): Promise<any> {
  const handler = applicationsHandlers[eventName]
  if (!handler) {
    return Promise.reject('未知的异常applications指令')
  }

  return handler(event, ...data)
}

const applicationSyncHandlers = {
  getOpenedIdList(): string[] {
    return Object.keys(_viewMap)
  },
  getCurrentAppInfo(event: IpcMainEvent): AppInfo | undefined {
    return { ...((event.sender as any)._appInfo || {}), db: undefined }
  }
}

/**
 * 应用同步处理器
 * @param param 参数
 * @returns 同步处理结果
 */
export function _applicationsSyncHandler(param: SdkHandlerParam<IpcMainEvent, void>): void {
  const handler = applicationSyncHandlers[param.eventName]
  if (!handler) {
    throw new Error('未知的异常applications指令')
  }

  return handler(param.event, ...param.otherData)
}

/**
 * 监听窗体大小变化
 * @param bw 窗体
 */
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

/**
 * 清除所有应用视图
 */
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
