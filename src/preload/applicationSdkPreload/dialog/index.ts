import { tryJsonParseDataHandler } from '../../_commons/tools'
import { sendSyncIpcEventWrapperEventNameAndDataCallBack } from '../tools'

const sendSyncIpcEvent = sendSyncIpcEventWrapperEventNameAndDataCallBack(
  'dialog',
  tryJsonParseDataHandler
)

export const dialog = {
  showOpenDialog(options: any): string[] | undefined {
    return sendSyncIpcEvent('showOpenDialog', options)
  },
  showSaveDialog(options: any): string | undefined {
    return sendSyncIpcEvent('showSaveDialog', options)
  }
}
