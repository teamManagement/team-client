import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

enum WindowsEventName {
  FULLSCREEN = 'WIN-FULLSCREEN',
  UN_FULLSCREEN = 'WIN-UN-FULLSCREEN',
  MAXIMIZE = 'WIN-MAXIMIZE',
  UNMAXIMIZE = 'WIN-UNMAXIMIZE',
  MINIMIZE = 'WIN-MINIMIZE',
  UNMINIMIZE = 'WIN-UN-MINIMIZE',
  ALWAYS_TOP = 'WIN-ALWAYS-TOP',
  UN_ALWAYS_TOP = 'WIN-UN-ALWAYS-TOP',
  EVENT_REGISTER = 'WIN-EVENT-REGISTER'
}

const renderEventMap: { [key: string]: () => void } = {}

async function _winOperation(
  event: IpcMainInvokeEvent,
  name: WindowsEventName,
  eventName: string,
  eventId: string
): Promise<void> {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) {
    return
  }

  if (name === WindowsEventName.EVENT_REGISTER) {
    if (!eventId) {
      throw new Error('缺失')
    }
    const callback: () => void = () => {
      event.sender.send(eventName)
    }
    renderEventMap[eventId] = callback
    winEventRegister(win, eventName, callback)
    return
  }
  winOperation(win, name)
}

export function winEventRegister(win: BrowserWindow, eventName: string, fn: any): void {
  win.addListener(eventName as any, fn)
}

export function winEventRemove(win: BrowserWindow, eventName: string, fn: any): void {
  win.removeListener(eventName as any, fn)
}

export function winOperation(win: BrowserWindow, operationName: WindowsEventName): void {
  switch (operationName) {
    case WindowsEventName.FULLSCREEN:
      win.setFullScreen(true)
      return
    case WindowsEventName.UN_FULLSCREEN:
      win.setFullScreen(false)
      return
    case WindowsEventName.MAXIMIZE:
      if (process.platform === 'win32') {
        if ((win as any)._unmaximizeBounds) {
          return
        }
        ;(win as any)._unmaximizeBounds = win.getBounds()
      }
      win.maximize()
      return
    case WindowsEventName.UNMAXIMIZE:
      if (process.platform === 'win32') {
        if (!(win as any)._unmaximizeBounds) {
          return
        }
        win.setBounds((win as any)._unmaximizeBounds)
        delete (win as any)._unmaximizeBounds
      } else {
        win.unmaximize()
      }
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
