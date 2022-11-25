import { UserInfo } from '@byzk/teamwork-sdk'
import { IpcMainInvokeEvent } from 'electron'
import { sendHttpRequestToLocalServer } from '../../../tools'

export interface UserListFilterOption {
  /**
   * 跳过应用商店管理员
   */
  breakAppStoreManager?: boolean
}

const remoteCacheHandlers = {
  async userList(filterOption?: UserListFilterOption): Promise<any> {
    const currentUser = await sendHttpRequestToLocalServer<UserInfo>('/user/now')
    const userCacheList: UserInfo[] = JSON.parse(
      await sendHttpRequestToLocalServer<string>('/cache/remote/user/list')
    )
    return userCacheList.filter((u) => {
      if (currentUser.id === u.id) {
        return false
      }

      if (filterOption?.breakAppStoreManager && u.isAppStoreManager) {
        return false
      }

      return true
    })
  }
}

export function _remoteCacheHandler(
  _event: IpcMainInvokeEvent,
  eventName: string,
  ...data: any
): Promise<any> {
  const handler = remoteCacheHandlers[eventName]
  if (!handler) {
    return Promise.reject('未知的远程缓存api指令')
  }
  return handler(...data)
}
