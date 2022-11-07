import { sendHttpRequestToLocalServer } from '../../../tools'
import { AppInfo } from '../../insideSdk/applications'

type EventName = 'isEnabled443' | 'enable443' | 'disable443'
export function _proxyHandler(
  _appInfo: AppInfo,
  eventName: EventName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ..._data: any
): Promise<any> {
  switch (eventName) {
    case 'isEnabled443':
      return isEnabled443()
    case 'enable443':
      return enable443()
    case 'disable443':
      return disable443()
    default:
      throw new Error('未知的代理事件名称')
  }
}

function isEnabled443(): Promise<boolean> {
  return sendHttpRequestToLocalServer('/proxy/config/is/running')
}

function enable443(): Promise<void> {
  return sendHttpRequestToLocalServer('/proxy/config/start')
}

function disable443(): Promise<void> {
  return sendHttpRequestToLocalServer('/proxy/config/shutdown')
}
