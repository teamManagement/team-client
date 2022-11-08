import { is } from '@electron-toolkit/utils'
import { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import { AppInfo } from '../applications'

const currentWindowHandlers = {
  /**
   * 全屏
   * @param win 窗体
   */
  fullscreen(win: BrowserWindow): void {
    win.setFullScreen(true)
  },
  /**
   * 取消全屏
   * @param win 窗体
   */
  unFullscreen(win: BrowserWindow): void {
    win.setFullScreen(false)
  },
  /**
   * 最大化
   * @param win 窗体
   */
  maximize(win: BrowserWindow): void {
    if (process.platform === 'win32') {
      if ((win as any)._unmaximizeBounds) {
        return
      }
      ;(win as any)._unmaximizeBounds = win.getBounds()
    }
    win.maximize()
  },
  /**
   * 取消最大化
   * @param win 窗体
   */
  unmaximize(win: BrowserWindow): void {
    if (process.platform === 'win32') {
      if (!(win as any)._unmaximizeBounds) {
        return
      }
      win.setBounds((win as any)._unmaximizeBounds)
      delete (win as any)._unmaximizeBounds
    } else {
      win.unmaximize()
    }
  },
  /**
   * 最小化
   * @param win 窗体
   */
  minimize(win: BrowserWindow): void {
    win.minimize()
  },
  /**
   * 取消最小化
   * @param win 窗体
   */
  unminimize(win: BrowserWindow): void {
    win.restore()
  },
  /**
   * 置顶
   * @param win 窗体
   */
  alwaysOnTop(win: BrowserWindow): void {
    win.setAlwaysOnTop(true)
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  },
  /**
   * 取消置顶
   * @param win 窗体
   */
  unAlwaysOnTop(win: BrowserWindow): void {
    win.setAlwaysOnTop(false)
    win.setVisibleOnAllWorkspaces(false)
  },
  /**
   * 显示
   * @param win 窗体
   */
  show(win: BrowserWindow): void {
    win.show()
  },
  /**
   * 隐藏
   * @param win 窗体
   */
  hide(win: BrowserWindow): void {
    win.hide()
  },
  /**
   * 关闭
   * @param win 窗体
   */
  close(win: BrowserWindow): void {
    win.close()
  },
  /**
   * 打开窗体中BrowserView的开发者工具
   * @param win 要操作的窗体
   */
  openBrowserViewDevTools(win: BrowserWindow): void {
    const view = win.getBrowserView()
    if (!view) {
      return
    }

    const bvWebContents = view.webContents
    const appInfo: AppInfo = (bvWebContents as any)._appInfo
    let debugging = is.dev
    if (!debugging) {
      debugging = (appInfo && appInfo.debugging) || false
    }

    if (!debugging) {
      return
    }

    bvWebContents.openDevTools()
  }
}

/**
 * currentWindow事件处理
 * @param eventName 事件名称
 * @param data 数据
 * @returns 响应数据
 */
export function _currentWindowHandler(
  event: IpcMainInvokeEvent,
  eventName: string,
  ...data: any
): Promise<any> {
  const handler = currentWindowHandlers[eventName]
  if (!handler) {
    return Promise.reject('未知的异常currentWindow指令')
  }

  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) {
    return Promise.reject('对应窗体不存在')
  }

  return handler(win, ...data)
}
