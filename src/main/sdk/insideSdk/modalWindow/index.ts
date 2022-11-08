import { BrowserWindow, IpcMainEvent } from 'electron'
import { SdkHandlerParam } from '../..'
import { CurrentInfo, WinNameEnum } from '../../../current'

const modalWindowHandlers = {
  showUserinfo(win: BrowserWindow): void {
    const userinfoModalWin = CurrentInfo.getWin(WinNameEnum.USERINFO)
    if (!userinfoModalWin) {
      throw new Error('用户信息窗体信息不存在')
    }
    userinfoModalWin.setParentWindow(win)
    userinfoModalWin.show()
    userinfoModalWin.focus()
  }
}

/**
 * modalWindow事件处理
 * @param param 参数
 */
export function _modalWindowHandler(param: SdkHandlerParam<IpcMainEvent, void>): Promise<any> {
  const handler = modalWindowHandlers[param.eventName]
  if (!handler) {
    return Promise.reject('未知的异常modalWindow指令')
  }

  const win = BrowserWindow.fromWebContents(param.event.sender)
  if (!win) {
    return Promise.reject('对应窗体不存在')
  }

  return handler(win, param.event, ...param.otherData)
}
