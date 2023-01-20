import { UserInfo } from '@teamworktoolbox/sdk'
import { tryJsonParseDataHandler } from '../../_commons/tools'
import { sendInvokeIpcEventWrapperEventNameAndDataCallBack } from '../tools'

const sendInvokeIpcEvent = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'remoteCache',
  tryJsonParseDataHandler
)

export interface UserListFilterOption {
  /**
   * 跳过应用商店管理员
   */
  breakAppStoreManager?: boolean
}

export const remoteCache = {
  userList(filterOption?: UserListFilterOption): Promise<UserInfo[]> {
    return sendInvokeIpcEvent('userList', filterOption)
  },
  orgList(): Promise<any> {
    return sendInvokeIpcEvent('orgList')
  }
}
