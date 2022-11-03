import { sendInvokeIpcEventWrapperEventNameAndDataCallBack } from '../tools'

const sendInvokeIpcEventWithNoDataHandler = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'hosts',
  undefined
)

export const hosts = {
  /**
   * 向host文件中添加行
   * @param lines 要添加的行
   */
  add(...line: string[]): Promise<void> {
    if (line.length === 0) {
      return Promise.resolve()
    }
    return sendInvokeIpcEventWithNoDataHandler('add', line)
  },
  /**
   * 向host文件中添加行
   * @param line 要添加的行
   */
  addToHeader(...line: string[]): Promise<void> {
    if (line.length === 0) {
      return Promise.resolve()
    }
    return sendInvokeIpcEventWithNoDataHandler('addToHeader', line)
  },
  /**
   * 导出内容
   * @returns hosts内容
   */
  export(): Promise<string> {
    return sendInvokeIpcEventWithNoDataHandler('export')
  },
  /**
   * 覆盖原有的hosts内容
   * @param newHostsContent 新的hosts文件内容
   */
  cover(newHostsContent: string): Promise<void> {
    return sendInvokeIpcEventWithNoDataHandler('cover', newHostsContent)
  },
  delete(dnsOrIp: string): Promise<void> {
    return sendInvokeIpcEventWithNoDataHandler('delete', dnsOrIp)
  }
}
