import {
  BrowserWindow,
  dialog,
  IpcMainEvent,
  OpenDialogSyncOptions,
  SaveDialogOptions
} from 'electron'
import { SdkHandlerParam } from '../..'

const dialogSyncHandlerMap = {
  showOpenDialog(currentWin: BrowserWindow, options?: OpenDialogSyncOptions): string[] | undefined {
    options = options || {}
    return dialog.showOpenDialogSync(currentWin, options)
  },
  showSaveDialog(currentWin: BrowserWindow, options?: SaveDialogOptions): string | undefined {
    options = options || {}
    return dialog.showSaveDialogSync(currentWin, options)
  }
}

export async function _dialogSyncHandler(
  param: SdkHandlerParam<IpcMainEvent, void>
): Promise<void> {
  //   const appInfo = (param.event.sender as any)._appInfo as AppInfo
  //   if (!appInfo) {
  //     throw new Error('未知的应用信息')
  //   }

  const bw = BrowserWindow.fromWebContents(param.event.sender)
  if (!bw) {
    throw new Error('获取当前窗体信息失败')
  }

  const handler = dialogSyncHandlerMap[param.eventName]
  if (!handler) {
    throw new Error('未知的dialog操作指令')
  }

  return handler(bw, ...param.otherData)
}
