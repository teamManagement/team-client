import { UserInfo } from '@renderer/vos/user'
import { useCallback, useEffect, useState } from 'react'
import { MessagePlugin } from 'tdesign-react'

export function useUserStatus(): 'online' | 'offline' {
  const [status, setStatus] = useState<'online' | 'offline'>('offline')
  useEffect(() => {
    const fn: (data: TcpTransferInfo<any>) => void = (data: TcpTransferInfo<any>) => {
      if (
        data.cmdCode === TcpTransferCmdCode.BLOCKING_CONNECTION ||
        data.cmdCode === TcpTransferCmdCode.RESTORE_SERVER_ERR
      ) {
        setStatus('offline')
      } else if (data.cmdCode === TcpTransferCmdCode.RESTORE_SERVER_OK) {
        setStatus('online')
      }
    }
    const fnId = window.teamworkInsideSdk.api.registerServerMsgHandler(fn)
    return () => {
      window.teamworkInsideSdk.api.removeServerMsgHandler(fnId)
    }
  }, [])
  const queryUserStatus = useCallback(async () => {
    try {
      setStatus(await window.teamworkInsideSdk.api.proxyHttpLocalServer('/user/status'))
    } catch (e) {
      setStatus('offline')
    }
  }, [])
  useEffect(() => {
    queryUserStatus()
  }, [])
  return status
}

export function useUserinfo(): UserInfo | undefined {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined)
  useEffect(() => {
    window.teamworkInsideSdk.api
      .proxyHttpLocalServer<UserInfo>('/user/now')
      .then((user) => {
        console.log('获取到的用户信息: ', user)
        setUserInfo(user)
      })
      .catch((e) => {
        MessagePlugin.error('获取用户信息失败: ' + ((e as any).message || e))
      })
  }, [])
  return userInfo
}
