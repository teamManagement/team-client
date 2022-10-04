import { app, BrowserWindow, dialog, ipcMain, IpcMainEvent } from 'electron'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import log from 'electron-log'
import { DialogTopWin } from './windows/common'
import { AppIcon } from './icons'
import { CurrentInfo } from './current'
import { SettingHomeWin } from './windows/home'
import { getInitSplashscreen } from './windows/welcome'
import { WsHandler } from './socket'
import { SettingLoginWin } from './windows/login'

app.commandLine.appendSwitch('--disable-http-cache')

const instanceLock = app.requestSingleInstanceLock()
if (!instanceLock) {
  app.exit(0)
}

process.on('uncaughtException', (error) => {
  if (error) {
    dialog.showMessageBoxSync(DialogTopWin(), {
      type: 'error',
      title: '致命错误',
      message: error.message,
      icon: AppIcon,
      buttons: ['确定']
    })
    app.exit(1)
  }
})

async function createWindow(): Promise<void> {
  const hideSplashscreen = getInitSplashscreen()
  const wsHandler = WsHandler.instance
  const connResult = await wsHandler.waitConnection(2)
  if (connResult) {
    SettingHomeWin(hideSplashscreen)
  } else {
    SettingLoginWin(hideSplashscreen)
  }
}

app.on('certificate-error', (event, webContents, url, error, certifcate, callback) => {
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
