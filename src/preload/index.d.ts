import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
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

  interface Window {
    electron: ElectronAPI
    api: unknown
    httpApi: {
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
  }
}
