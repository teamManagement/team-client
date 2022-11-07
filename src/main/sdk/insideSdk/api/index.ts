import { IpcMainInvokeEvent } from 'electron'
import { CurrentInfo, WinNameEnum } from '../../../current'
import { WsHandler } from '../../../socket'
import {
  RequestOption,
  sendHttpRequestToLocalServer,
  sendHttpRequestToCoreHttpServer
} from '../../../tools'
import { SettingHomeWin } from '../../../windows/home'

const apiHandlers = {
  /**
   * 登录
   * @param username 用户名
   * @param password 密码
   */
  async login(username: string, password: string): Promise<any> {
    await WsHandler.instance.login(username, password)
    await SettingHomeWin((win) => {
      CurrentInfo.getWin(WinNameEnum.LOGIN)?.close()
      win.show()
    })
  },
  /**
   * 用户登出
   */
  logout(): Promise<void> {
    return WsHandler.instance.logout()
  },
  /**
   * 请求核心server
   * @param url url路径
   * @param options 请求选项
   * @returns 响应结果
   */
  proxyHttpCoreServer(url: string, options?: RequestOption): Promise<any> {
    return sendHttpRequestToCoreHttpServer(url, options)
  },
  /**
   * 请求本地http服务
   * @param url 请求地址
   * @param options 请求选项
   * @returns 请求结果
   */
  proxyHttpLocalServer(url: string, options?: RequestOption): Promise<any> {
    return sendHttpRequestToLocalServer(url, options)
  }
}

/**
 * api事件处理
 * @param _event 事件
 * @param eventName 事件名称
 * @param data 数据
 * @returns 响应数据
 */
export function _apiHandler(
  _event: IpcMainInvokeEvent,
  eventName: string,
  ...data: any
): Promise<any> {
  const handler = apiHandlers[eventName]
  if (!handler) {
    return Promise.reject('未知的异常Api指令')
  }

  return handler(...data)
}
