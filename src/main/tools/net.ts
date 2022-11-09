import { net } from 'electron'

// const localServerAddress = 'https://127.0.0.1:65528'

export interface DataWrite {
  write(chunk: string | Buffer, encoding?: string, callback?: () => void): void
}

export interface ResponseResult {
  code: string
  error?: boolean
  msg?: string
  result?: any
}

/**
 * 响应错误
 */
export interface ResponseError {
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

export interface RequestOption {
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'OPTION'
  jsonData?: any
  dataWrite?: (writer: DataWrite) => void
  header?: { [key: string]: string }
  timeout?: number
}

function _sendHttpRequestBase<T>(url: string, options?: RequestOption): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // try {
    options = options || {}

    options.method = options.method || 'POST'

    const request = net.request({
      path: url,
      hostname: '127.0.0.1',
      port: 65528,
      method: options.method,
      protocol: 'https:'
    })

    request.chunkedEncoding = true

    if (options.header) {
      for (const key in options.header) {
        request.setHeader(key, options.header[key])
      }
    }

    request.setHeader('User-Agent', 'teamManagerLocalView')

    if (options.jsonData) {
      request.setHeader('Content-Type', 'application/json;charset=utf8')
      request.write(JSON.stringify(options.jsonData))
    }

    if (options.dataWrite) {
      options.dataWrite(request)
    }

    request.addListener('error', (e) => {
      reject({
        error: true,
        message: e.message,
        code: '-1'
      } as ResponseError)
    })

    if (typeof options.timeout !== 'number') {
      options.timeout = 5000
    }

    let timeoutId: any = undefined
    if (options.timeout >= 0) {
      timeoutId = setTimeout(() => {
        request.abort()
        reject({
          error: true,
          httpCode: 408,
          message: 'request time out',
          code: '408'
        } as ResponseError)
      }, options.timeout)
    }

    request.on('response', (res) => {
      if (typeof timeoutId !== 'undefined') {
        clearTimeout(timeoutId)
      }
      let buffer: Buffer | undefined = undefined

      res.on('data', (data) => {
        if (!buffer) {
          buffer = data
          return
        }

        buffer = Buffer.concat([buffer, data])
      })

      res.on('end', () => {
        if (!buffer) {
          if (res.statusCode < 200 || res.statusCode > 299) {
            const message = res.statusCode == 502 ? '网络异常' : '未知的异常'
            reject({
              error: true,
              httpCode: res.statusCode,
              message,
              code: '-1'
            } as ResponseError)
            return
          }
          resolve(undefined as T)
          return
        }
        const bufStr = buffer!.toString()
        try {
          const resData = JSON.parse(bufStr) as ResponseResult
          if (resData.error) {
            reject({
              error: true,
              httpCode: res.statusCode,
              raw: bufStr,
              message: resData.msg,
              code: resData.code
            } as ResponseError)
            return
          }

          // if (typeof resData.result === 'undefined') {
          //   resData.result = {}
          // }

          resolve(resData.result)
        } catch (e) {
          reject({
            error: true,
            httpCode: res.statusCode,
            raw: bufStr,
            message: '未知的异常',
            code: '1'
          } as ResponseError)
        }
      })
    })

    request.end('')
    // } catch (e) {}
  })
}

export function sendHttpRequestToLocalServer<T>(url: string, options?: RequestOption): Promise<T> {
  return _sendHttpRequestBase(url, options)
}

export function sendHttpRequestToCoreHttpServer<T>(
  url: string,
  options?: RequestOption
): Promise<T> {
  if (!url.startsWith('/')) {
    url = '/' + url
  }

  url = '/p/web' + url

  return _sendHttpRequestBase(url, options)
}
