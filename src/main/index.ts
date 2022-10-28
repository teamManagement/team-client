import { app, BrowserWindow, dialog, ipcMain, IpcMainEvent, screen } from 'electron'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import log from 'electron-log'
import { DialogTopWin } from './windows/common'
import { AppIcon } from './icons'
import { CurrentInfo } from './current'
import { SettingHomeWin } from './windows/home'
import { getInitSplashscreen } from './windows/welcome'
import { WsHandler } from './socket'
import { SettingLoginWin } from './windows/login'
import { initMainProcessEvents } from './events'
import { installCaCert, installLocalServer, verifyExternalProgramHash } from './process'
import { initApiProxy } from './apiProxy'
import { alertPanic } from './windows/alerts'
import { initApplicationViewManager } from './applications/manager'
import { initNotificationEvent } from './notification'

app.commandLine.appendSwitch('--disable-http-cache')

log.debug('日志文件路径: ', log.transports.file.getFile().path)

const instanceLock = app.requestSingleInstanceLock()
if (!instanceLock) {
  app.exit(0)
}

process.on('uncaughtException', (error) => {
  console.log(error)
  alertPanic(error.message)
})

async function createWindow(): Promise<void> {
  const allDisplay = screen.getAllDisplays()
  console.log(allDisplay)
  const hideSplashscreen = getInitSplashscreen()

  log.debug('初始化electron api代理...')
  initApiProxy()

  log.debug('验证外部程序文件Hash...')
  if (!(await verifyExternalProgramHash())) {
    alertPanic('程序文件被篡改, 请尝试重新安装')
    return
  }

  log.debug('外部程序文件Hash验证通过')

  log.debug('安装团队协作平台CA根证书...')
  if (!(await installCaCert())) {
    alertPanic(
      '安装团队协作平台根证书失败, 请尝试重新打开本应用, 如多次均提示本错误, 请联系管理员使用外部修复工具进行修复!!!'
    )
    return
  }

  log.debug('启动本地服务...')
  if (!(await installLocalServer())) {
    alertPanic(
      '启动团队协作平台本地组件失败, 请尝试重新打开本应用, 如多次均提示本错误, 请联系管理员使用外部修复工具进行修复!!!'
    )
    return
  }

  try {
    const wsHandler = WsHandler.instance
    const connResult = await wsHandler.waitConnection(2)
    log.debug('注册socket消息转发事件...')
    WsHandler.initServerMsgTransferEvents()
    log.debug('注册socket消息转发事件完毕!')

    log.debug('注册应用视图事件...')
    initApplicationViewManager()
    log.debug('注册应用试图相关事件完毕!')

    log.debug('注册消息通知事件...')
    initNotificationEvent()
    log.debug('注册消息通知事件完毕！！！')

    if (connResult) {
      if ((await wsHandler.loginOk()) || (await wsHandler.autoLogin())) {
        SettingHomeWin((win) => {
          win.show()
          hideSplashscreen()
        })
        return
      }
    }
    SettingLoginWin(hideSplashscreen)
  } catch (e) {
    console.log(e)
    dialog.showMessageBoxSync(DialogTopWin(), {
      type: 'error',
      title: '致命错误',
      message: '程序启动失败, 请尝试重启, 本次错误: ' + ((e as any).message || e),
      icon: AppIcon,
      buttons: ['确定']
    })
    app.exit(1)
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.on('certificate-error', (_event, _webContents, url, _error, _certifcate, _callback) => {
  console.log('+++++++++++++++++++++++++++++++++++++++++++++++')
  log.info('cert error, url: ', url)
})

app.on('activate', () => {
  CurrentInfo.CurrentWindow?.show()
})

app.on('second-instance', () => {
  CurrentInfo.CurrentWindow?.show()
})

app.on('ready', () => {
  initMainProcessEvents()
  ipcMain.addListener('appExit', (_event: IpcMainEvent, code?: number) => {
    app.exit(code || 0)
  })

  ipcMain.addListener('appHide', (event: IpcMainEvent) => {
    BrowserWindow.fromWebContents(event.sender)?.hide()
  })

  // Set app user model id for windows
  electronApp.setAppUserModelId('cn.bk.team.client')

  if (is.dev) {
    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
  }

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.whenReady().then(() => {})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
