import { BrowserWindowConstructorOptions, ipcRenderer } from 'electron'

enum ModalWindowsEventName {
  /**
   * 创建内部模态度窗口
   */
  CREATE_INSIDE_MODAL_WINDOW = 'ipc-MODAL_WINDOWS_CREATE_INSIDE'
}

export const modalWindow = {
  showInside(url: string, options: BrowserWindowConstructorOptions, attachInfo: any): void {
    ipcRenderer.sendSync(ModalWindowsEventName.CREATE_INSIDE_MODAL_WINDOW, url, options, attachInfo)
  }
}
