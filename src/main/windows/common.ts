import path from 'path'
import { BrowserWindow, BrowserWindowConstructorOptions, app, dialog, shell } from 'electron'
import { is } from '@electron-toolkit/utils'
import { CurrentInfo, winWebContentsIdMap, WinNameEnum } from '../current'
import { AppIcon } from '../icons'
import { WsHandler } from '../socket'
import { PRELOAD_JS_INSIDE } from '../consts'

export async function SettingWindow(
  winNameEnum: WinNameEnum,
  windowOptions: BrowserWindowConstructorOptions,
  viewUrl: string,
  current: boolean,
  callBackOptions?: {
    afterSettingOptions?: (win: BrowserWindow) => void
    readyToShowFn?: (win: BrowserWindow) => void
    closeFn?: (win: BrowserWindow) => void
  },
  closeNoClearResources?: boolean
): Promise<BrowserWindow> {
  const nowWin = CurrentInfo.getWin(winNameEnum)
  if (nowWin) {
    if (current) {
      CurrentInfo.SettingCurrentWindow(winNameEnum)
    }
    return Promise.resolve(nowWin)
  }
  const winOption: BrowserWindowConstructorOptions = {
    icon: AppIcon,
    show: false,
    ...windowOptions,
    webPreferences: {
      preload: PRELOAD_JS_INSIDE,
      sandbox: false
    }
  }
  const win = new BrowserWindow(winOption)
  if (callBackOptions && callBackOptions.afterSettingOptions) {
    callBackOptions.afterSettingOptions(win)
  }
  const webContents = win.webContents
  const webContentsId = webContents.id
  win.on('closed', () => {
    try {
      if (!closeNoClearResources) {
        WsHandler.instance.clearWebContentResource(webContents)
      }
      if (callBackOptions && callBackOptions.closeFn) {
        callBackOptions.closeFn(win)
      }
    } finally {
      if (BrowserWindow.getAllWindows().length === 0) {
        app.exit(0)
        // eslint-disable-next-line no-unsafe-finally
        return
      }
      CurrentInfo.setWin(winNameEnum, undefined)
      if (CurrentInfo.CurrentWindowName === winNameEnum) {
        CurrentInfo.SettingCurrentWindow(undefined)
      }
    }
  })

  let loadOk = false
  win.on('ready-to-show', () => {
    loadOk = true
    if (callBackOptions && callBackOptions.readyToShowFn) {
      callBackOptions.readyToShowFn(win)
    }
  })
  win.webContents.on('did-fail-load', (_event, errCode, errMsg) => {
    console.log('路径: ', viewUrl, '结束')
    console.log(viewUrl, ' 加载失败，错误代码: ', errCode, ' 错误信息: ', errMsg)
    if (loadOk) {
      return
    }
    dialog.showMessageBoxSync(DialogTopWin(), {
      type: 'error',
      title: '窗体资源加载失败',
      message: '请重启应用进行尝试, 错误码: ' + errCode + ', 错误信息: ' + errMsg,
      icon: AppIcon,
      buttons: ['确定']
    })
    app.exit(1)
  })
  winWebContentsIdMap[webContentsId] = win.webContents
  try {
    if (!viewUrl.startsWith('/')) {
      viewUrl = '/' + viewUrl
    }
    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      await win.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#' + viewUrl)
    } else {
      await win.loadFile(path.join(__dirname, '../renderer/index.html'), { hash: viewUrl })
    }
    win.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
  } catch (e) {
    // delete winWebContentsIdMap[webContentsId];
    // clearWindowResources(webContentsId)
  }
  CurrentInfo.setWin(winNameEnum, win, current)
  if (current) {
    CurrentInfo.SettingCurrentWindow(winNameEnum)
  }
  return Promise.resolve(win)
}

let dialogTopWin: BrowserWindow | undefined = undefined
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const DialogTopWin = () => {
  if (!dialogTopWin) {
    dialogTopWin = new BrowserWindow({
      alwaysOnTop: true,
      transparent: true,
      frame: false,
      width: 0,
      height: 0
    })
  }
  return dialogTopWin
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const OfficeTemplate = function (_a) {
  // eslint-disable-next-line no-var
  var _b = _a.logo,
    logo =
      _b === void 0
        ? 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Microsoft_Office_2013_logo.svg'
        : _b,
    _c = _a.brand,
    brand = _c === void 0 ? 'Brand' : _c,
    _d = _a.productName,
    productName = _d === void 0 ? 'Product' : _d,
    _e = _a.text,
    text = _e === void 0 ? 'Loading ...' : _e,
    _f = _a.website,
    website = _f === void 0 ? 'www.website.com' : _f,
    _g = _a.color,
    color = _g === void 0 ? '#666' : _g
  return `\n<!DOCTYPE html>\n<meta charset="utf-8">\n<html>\n\n<head>\n\n  <style>\n    body,\n    html {\n      margin: 0;\n      overflow: hidden;\n    }\n\n    #box {\n      position: absolute;\n      user-select: none;\n      width: 100%;\n      height: 100%;\n      overflow: hidden;\n      margin: auto;\n    }\n\n    #logo {\n      height: 16px;\n      position: absolute;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      top: 25px;\n      left: 25px;\n    }\n\n    #logo img {\n      width: 18px;\n    }\n\n    #logo h6 {\n      color: white;\n      font-size: 16px;\n      font-weight: 200;\n      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";\n      letter-spacing: 0px;\n      margin-left: 5px;\n    }\n\n    #box h1 {\n      color: white;\n      display: inline-block;\n      font-size: 30px;\n      position: absolute;\n      left: 50%;\n      top: 39%;\n      transform: translateX(-50%) translateY(-120%);\n    }\n\n    #box .text {\n      color: white;\n      font-weight: 400;\n      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";\n    }\n\n    #box h4 {\n      font-size: 12px;\n      font-weight: 400;\n      opacity: 50%;\n    }\n\n    #starting-txt {\n      position: absolute;\n      left: 25px;\n      bottom: 13px;\n    }\n\n    #author-txt {\n      position: absolute;\n      right: 25px;\n      bottom: 13px;\n    }\n\n    #author-txt a {\n      color: inherit;\n      text-decoration: none;\n    }\n\n    .text img {\n      width: 15px;\n    }\n\n    .dot {\n      width: 4px;\n      height: 4px;\n      top: 50%;\n      left: -20%;\n      transform: translateY(40px);\n      position: absolute;\n      margin: auto;\n      border-radius: 5px;\n      background: white;\n    }\n\n    #dot1 {\n      animation: dotslide 2.8s infinite cubic-bezier(0.2, .8, .8, 0.2);\n    }\n\n    #dot2 {\n      animation: dotslide 2.8s .2s infinite cubic-bezier(0.2, .8, .8, 0.2);\n    }\n\n    #dot3 {\n      animation: dotslide 2.8s .4s infinite cubic-bezier(0.2, .8, .8, 0.2);\n    }\n\n    #dot4 {\n      animation: dotslide 2.8s .6s infinite cubic-bezier(0.2, .8, .8, 0.2);\n    }\n\n    #dot5 {\n      animation: dotslide 2.8s .8s infinite cubic-bezier(0.2, .8, .8, 0.2);\n    }\n\n    @keyframes dotslide {\n      0% {\n        left: -20%;\n      }\n\n      100% {\n        left: 120%;\n      }\n    }\n  </style>\n</head>\n\n<body style="background-color:${color}">\n  <div id="box" style="background-color:${color}">\n    <span id="logo">\n      <img id="logo-img" src="${logo}" />\n      <h6 id="logo-text">${brand}</h6>\n    </span>\n    <h1 id="product" class="text">${productName}</h1>\n <h3 style="position:absolute;color:#888;left:33%;top:40%;">协作共进, 共研未来</h3>    <div class="dot" id="dot1"></div>\n    <div class="dot" id="dot2"></div>\n    <div class="dot" id="dot3"></div>\n    <div class="dot" id="dot4"></div>\n    <div class="dot" id="dot5"></div>\n    <h4 class="text" id="starting-txt">${text}</h4>\n    <h4 class="text" id="author-txt">${website}</h4>\n  </div>\n</body>\n\n</html>\n`
}
