import { tryJsonParseDataHandler } from '../../_commons/tools'
import { sendInvokeIpcEventWrapperEventNameAndDataCallBack } from '../tools'
import { serverMsgTransferFns } from './serverMsgTransfer'

interface HttpOptions {
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'OPTION'
  jsonData?: any
  header?: { [key: string]: string }
}

const sendInvokeIpcEvent = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'api',
  tryJsonParseDataHandler
)

export const api = {
  /**
   *
   * @param username 用户名
   * @param password 密码
   * @returns 登录
   */
  login(username: string, password: string): Promise<void> {
    return sendInvokeIpcEvent('login', username, password)
  },
  /**
   * 登出
   */
  logout(): void {
    sendInvokeIpcEvent('logout')
  },
  /**
   * 请求远程核心http服务
   * @param url 请求路径
   * @param options 请求参数
   * @returns 请求结果
   */
  proxyHttpCoreServer(url: string, options: HttpOptions): Promise<any> {
    return sendInvokeIpcEvent('proxyHttpCoreServer', url, options)
  },
  /**
   * 请求本地http服务
   * @param url 请求地址
   * @param options http选项
   * @returns 请求结果
   */
  proxyHttpLocalServer(url: string, options: HttpOptions): Promise<any> {
    return sendInvokeIpcEvent('proxyHttpLocalServer', url, options)
  },
  ...serverMsgTransferFns
}
