import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

enum WindowsEventName {
  FULLSCREEN = 'WIN-FULLSCREEN',
  UN_FULLSCREEN = 'WIN-UN-FULLSCREEN',
  MAXIMIZE = 'WIN-MAXIMIZE',
  UNMAXIMIZE = 'WIN-UNMAXIMIZE',
  MINIMIZE = 'WIN-MINIMIZE',
  UNMINIMIZE = 'WIN-UN-MINIMIZE',
  ALWAYS_TOP = 'WIN-ALWAYS-TOP',
  UN_ALWAYS_TOP = 'WIN-UN-ALWAYS-TOP'
}

async function _winOperation(event: IpcMainInvokeEvent, name: WindowsEventName): Promise<void> {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) {
    return
  }

  switch (name) {
    case WindowsEventName.FULLSCREEN:
      win.setFullScreen(true)
      return
    case WindowsEventName.UN_FULLSCREEN:
      win.setFullScreen(false)
      return
    case WindowsEventName.MAXIMIZE:
      win.maximize()
      return
    case WindowsEventName.UNMAXIMIZE:
      win.unmaximize()
      return
    case WindowsEventName.MINIMIZE:
      win.minimize()
      return
    case WindowsEventName.UNMINIMIZE:
      win.restore()
      return
    case WindowsEventName.ALWAYS_TOP:
      win.setAlwaysOnTop(true)
      win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
      break
    case WindowsEventName.UN_ALWAYS_TOP:
      win.setAlwaysOnTop(false)
      win.setVisibleOnAllWorkspaces(false)
      return
  }
}

export function _initWindowsEvent(): void {
  ipcMain.handle('ipc-win-operation', _winOperation)
}

// async function _invokeWithWin(
//   sender: WebContents,
//   fn: (win: BrowserWindow) => void | Promise<void>
// ): Promise<void> {
//   const win = BrowserWindow.fromWebContents(sender)
//   if (!win) {
//     return
//   }
//   const r = fn(win)
//   if (r instanceof Promise) {
//     await r
//   }
// }
