import { is, optimizer } from '@electron-toolkit/utils'
import path from 'path'
import { BrowserView, BrowserWindow, ipcMain, IpcMainInvokeEvent, Rectangle } from 'electron'

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
  HIDE_VIEW = 'ipc-HIDE_VIEW'
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

  const bw = BrowserWindow.fromWebContents(event.sender)
  if (!bw) {
    throw new Error('应用窗体不存在')
  }

  if (bw.getBrowserView() !== view) {
    bw.setBrowserView(view)
  }

  const _view = view as any
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
      bounds.width = parseInt(bwBounds.width + '')
    }

    if (typeof boundsOptions?.height !== 'undefined') {
      bounds.height = parseInt(boundsOptions.height + '')
    } else {
      bounds.height = parseInt(bwBounds.height + '')
    }

    if (typeof boundsOptions?.widthOffset !== 'undefined') {
      bounds.width += parseInt(boundsOptions.widthOffset + '')
    }

    if (typeof boundsOptions?.heightOffset !== 'undefined') {
      bounds.height += parseInt(boundsOptions.heightOffset + '')
    }
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

  view.setBounds(bounds)
  view.setAutoResize({
    width: true,
    height: true
  })
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
}

async function hideView(_event: IpcMainInvokeEvent, id: string): Promise<void> {
  try {
    const view = checkViewById(id)
    const bw = BrowserWindow.fromBrowserView(view)
    if (!bw) {
      return
    }

    const bv = bw.getBrowserView()
    if (!bv) {
      return
    }

    const bounds = bv.getBounds()
    ;(bv as any).originBounds = bounds

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
    ;(view.webContents as any).destroy()
    delete _viewMap[id]
  } catch (e) {
    //nothing
  }
}

async function createView(
  _event: IpcMainInvokeEvent,
  id: string,
  loadInsidePreload?: boolean
): Promise<void> {
  if (!id) {
    throw new Error('缺失应用ID')
  }

  if (_viewMap[id]) {
    return
  }

  let preload: string | undefined = undefined
  if (loadInsidePreload) {
    preload = path.join(__dirname, '..', 'preload', 'index.js')
  }

  const bv = new BrowserView({
    webPreferences: {
      preload: preload,
      sandbox: false
    }
  })
  _viewMap[id] = bv

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
}

export function clearAllApplicationViews(): void {
  for (const k in _viewMap) {
    const webContents = _viewMap[k].webContents as any
    webContents.destroy()
    delete _viewMap[k]
  }
  _viewMap = {}
}
