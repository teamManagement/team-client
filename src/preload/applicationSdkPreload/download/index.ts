import { ipcRenderer } from 'electron'
import { id } from '../../_commons/id'
import { tryJsonParseDataHandler } from '../../_commons/tools'
import { sendInvokeIpcEventWrapperEventNameAndDataCallBack } from '../tools'

const sendInvokeEvent = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'download',
  tryJsonParseDataHandler
)

interface DownloadOperationInterface {
  id: string
  waitDone(): Promise<void>
}

interface DownloadProgressHandler {
  operation: DownloadOperationInterface
  resolve: () => void
  reject: (err: Error) => void
  updateCallBack?(percentage: number, receivedBytes: number, totalBytes: number): void
}

const ipcDownloadProgressNoticeHandlerMap: {
  [key: string]: DownloadProgressHandler
} = {}

ipcRenderer.addListener(
  'ipc-download-progress-notice',
  (_event, id: string, eventName: string, ...data: any[]) => {
    const handler = ipcDownloadProgressNoticeHandlerMap[id]
    if (!handler) {
      return
    }

    switch (eventName) {
      case 'update':
        handler.updateCallBack && handler.updateCallBack(data[0], data[1], data[2])
        return
      case 'done':
        handler.resolve()
        return
    }
  }
)

interface HttpDownloadOptions {
  updateCallBack?(percentage: number, receivedBytes: number, totalBytes: number): void
  savePath?: string
}

function createHttpDownloadOperation(
  url: string,
  options?: HttpDownloadOptions
): DownloadOperationInterface {
  options = options || {}
  const uniqueId = id.uuid()
  const downloadOperation: DownloadOperationInterface = {
    id: uniqueId,
    waitDone(): Promise<void> {
      return _waitDone
    }
  }

  const _waitDone = new Promise<void>((resolve, reject) => {
    const downloadHandler: DownloadProgressHandler = {
      operation: downloadOperation,
      resolve,
      reject,
      updateCallBack: options?.updateCallBack
    }

    ipcDownloadProgressNoticeHandlerMap[uniqueId] = downloadHandler
    delete options?.updateCallBack
    sendInvokeEvent('httpFile', uniqueId, url, options?.savePath)
  })
  return downloadOperation
}

// https://cdimage.kali.org/kali-2022.4/kali-linux-2022.4-installer-amd64.iso
export const download = {
  httpFile(url: string, options?: any): DownloadOperationInterface {
    return createHttpDownloadOperation(url, options)
    // return sendInvokeEvent('httpFile', id.uuid(), url)
  }
}
