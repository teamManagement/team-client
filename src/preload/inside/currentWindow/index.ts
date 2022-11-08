import { tryJsonParseDataHandler } from '../../_commons/tools'
import { sendInvokeIpcEventWrapperEventNameAndDataCallBack } from '../tools'

const sendInvokeIpcEvent = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'currentWindow',
  tryJsonParseDataHandler
)

export const currentWindow = {
  /**
   * 全屏
   */
  fullscreen(): Promise<void> {
    return sendInvokeIpcEvent('fullscreen')
  },
  /**
   * 取消全屏
   */
  unFullscreen(): Promise<void> {
    return sendInvokeIpcEvent('unFullscreen')
  },
  /**
   * 最大化
   */
  maximize(): Promise<void> {
    return sendInvokeIpcEvent('maximize')
  },
  /**
   * 取消最大化
   */
  unmaximize(): Promise<void> {
    return sendInvokeIpcEvent('unmaximize')
  },
  /**
   * 最小化
   */
  minimize(): Promise<void> {
    return sendInvokeIpcEvent('minimize')
  },
  /**
   * 取消最小化
   */
  unminimize(): Promise<void> {
    return sendInvokeIpcEvent('unminimize')
  },
  /**
   * 置顶
   */
  alwaysOnTop(): Promise<void> {
    return sendInvokeIpcEvent('alwaysOnTop')
  },
  /**
   * 取消置顶
   */
  unAlwaysOnTop(): Promise<void> {
    return sendInvokeIpcEvent('unAlwaysOnTop')
  },
  /**
   * 显示
   */
  show(): Promise<void> {
    return sendInvokeIpcEvent('show')
  },
  /**
   * 隐藏
   */
  hide(): Promise<void> {
    return sendInvokeIpcEvent('hide')
  },
  /**
   * 关闭
   */
  close(): Promise<void> {
    return sendInvokeIpcEvent('close')
  },

  /**
   * 打开窗体中BrowserView的开发者工具
   */
  openBrowserViewDevTools(): Promise<void> {
    return sendInvokeIpcEvent('openBrowserViewDevTools')
  }
}
