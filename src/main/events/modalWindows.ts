import { BrowserWindow, BrowserWindowConstructorOptions, ipcMain, IpcMainEvent } from 'electron'
import { WinNameEnum } from '../current'
import { SettingWindow } from '../windows/common'

enum ModalWindowsEventName {
  /**
   * 创建内部模态度窗口
   */
  CREATE_INSIDE_MODAL_WINDOW = 'ipc-MODAL_WINDOWS_CREATE_INSIDE'
}

export function _initModalWindowsEvents(): void {
  ipcMain.addListener(ModalWindowsEventName.CREATE_INSIDE_MODAL_WINDOW, createModalWindow)
}

async function createModalWindow(
  event: IpcMainEvent,
  url: string,
  options: BrowserWindowConstructorOptions,
  attachInfo: object
): Promise<void> {
  const parent = BrowserWindow.fromWebContents(event.sender)
  if (!parent) {
    throw new Error('窗体信息不存在')
  }

  await new Promise<void>((resolve, reject) => {
    try {
      SettingWindow(
        WinNameEnum.USERINFO,
        {
          ...options,
          parent,
          frame: false,
          resizable: false,
          maximizable: false,
          minimizable: false,
          modal: true,
          transparent: true,
          show: false
        },
        url,
        false,
        {
          readyToShowFn(win) {
            // 因为内部信息可能通过异步加载，可能会导致页面首次白屏显示，
            // 因此在页面dom加载完成之后在次延迟500ms给页面一个缓冲的时间
            // 后期如果有更好的方式在进行替换
            setTimeout(() => {
              win.show()
              resolve()
            }, 500)
          }
        },
        true,
        attachInfo
      )
    } catch (e) {
      reject(e)
    }
  })
  event.returnValue = true
}
