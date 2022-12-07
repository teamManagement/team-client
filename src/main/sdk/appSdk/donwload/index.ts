import { DownloadItem, Event, IpcMainInvokeEvent, WebContents } from 'electron'
import { SdkHandlerParam } from '../..'
import AsyncLock from 'async-lock'
import { AppInfo } from '../../insideSdk/applications'

const lock = new AsyncLock()
const lockKey = 'downloadLock'

const downloadProgressEventKey = 'ipc-download-progress-notice'

let globalWaitDownloadInfo:
  | { id: string; url: string; waitPromiseResolve: () => void; downloadInfo: DownloadInfo }
  | undefined = undefined

interface DownloadInfo {
  id: string
  type: 'http'
  status?: 'waitDownload' | 'downloading' | 'error' | 'ok'
  errMsg?: string
  httpDownloadItemCall: (downloadItem: DownloadItem) => void
  savePath?: string
}

// interface HttpDownloadOptions {
//   savePath?: string
// }

// const downloadingMap: { [key: string]: DownloadInfo } = {}

const downloadHandlerMap = {
  httpFile(
    currentWinWebContent: WebContents,
    id: string,
    downloadUrl: string,
    savePath?: string
  ): any {
    return lock.acquire(lockKey, async (done) => {
      try {
        await new Promise<void>((resolve, reject) => {
          const downloadTimeoutId = setTimeout(() => {
            lock.acquire(lockKey, (done) => {
              try {
                if (!globalWaitDownloadInfo) {
                  return
                }

                globalWaitDownloadInfo = undefined

                reject(new Error('请求超时'))
              } finally {
                done()
              }
            })
          }, 1000 * 30)

          const httpDownloadInfo: DownloadInfo = {
            id,
            type: 'http',
            status: 'waitDownload',
            savePath,
            httpDownloadItemCall: (item) => {
              console.log('进入回调了')
              clearTimeout(downloadTimeoutId)
              console.log(item)
              if (savePath) {
                item.setSavePath(savePath)
              }
              item.on('updated', () => {
                const percentage = parseInt(
                  100 * (item.getReceivedBytes() / item.getTotalBytes()) + ''
                )
                console.log('调用update => ', percentage)
                currentWinWebContent.send(
                  downloadProgressEventKey,
                  id,
                  'update',
                  percentage,
                  item.getReceivedBytes(),
                  item.getTotalBytes()
                )
              })

              item.on('done', () => {
                currentWinWebContent.send(downloadProgressEventKey, id, 'done')
              })
            }
          }

          globalWaitDownloadInfo = {
            id,
            url: downloadUrl,
            waitPromiseResolve: resolve,
            downloadInfo: httpDownloadInfo
          }

          currentWinWebContent.session.downloadURL(downloadUrl)
        })
      } finally {
        done(undefined, id)
      }
    })
  }
}

export function _downloadHandler(param: SdkHandlerParam<IpcMainInvokeEvent, AppInfo>): string {
  const handler = downloadHandlerMap[param.eventName]
  if (!handler) {
    throw new Error('未知的download指令')
  }

  return handler(param.event.sender, ...param.otherData)
}

export async function registerDownloadEvent(event: Event, item: DownloadItem): Promise<void> {
  if (!globalWaitDownloadInfo) {
    event.preventDefault()
    return
  }

  if (!item.getURLChain().includes(globalWaitDownloadInfo.url)) {
    //   if (globalWaitDownloadInfo.url !== item.getURL()) {
    event.preventDefault()
    return
  }

  const currentDownloadInfo = globalWaitDownloadInfo
  globalWaitDownloadInfo = undefined

  currentDownloadInfo.waitPromiseResolve()
  await lock.acquire(lockKey, (done) => {
    try {
      const id = currentDownloadInfo.id
      if (!id) {
        event.preventDefault()
        return
      }

      const downloadInfo = currentDownloadInfo.downloadInfo
      if (!downloadInfo) {
        event.preventDefault()
        return
      }

      if (downloadInfo.type !== 'http') {
        downloadInfo.status = 'error'
        downloadInfo.errMsg = '下载类型错误'
        event.preventDefault()
        return
      }

      console.log('进入下载回调')
      setTimeout(() => downloadInfo.httpDownloadItemCall(item), 0)
    } finally {
      done()
    }
  })
  console.log('调用下载回调成功')
}
