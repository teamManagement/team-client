import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface DataWrite {
  write(chunk: string | Buffer, encoding?: string, callback?: () => void): void
}

interface HttpApiInterface {
  webServerProxy<T>(
    url: string,
    options?: {
      method?: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'OPTION'
      jsonData?: any
      dataWrite?: (writer: DataWrite) => void
      header?: { [key: string]: string }
    }
  ): Promise<T>
}

/**
 * 响应错误
 */
interface ResponseError {
  error?: boolean
  /**
   * 状态码
   */
  httpCode: number

  /**
   * 错误码
   */
  code: string

  /**
   * 错误消息
   */
  message: string

  /**
   * 原始数据
   */
  raw: string
}

// Custom APIs for renderer
const api = {}

const httpApi = {
  webServerProxy: async (url, options) => {
    const response = (await ipcRenderer.invoke(
      'ipc-proxy-web-server',
      url,
      JSON.stringify(options)
    )) as ResponseError

    if (response.error) {
      throw response
    }
    return response
  }
} as HttpApiInterface

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('httpApi', httpApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.httpApi = httpApi
}
