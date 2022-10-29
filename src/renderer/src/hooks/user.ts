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
    window.proxyApi.registerServerMsgHandler(fn)
    return () => {
      window.proxyApi.removeServerMsgHandler(fn)
    }
  }, [])
  const queryUserStatus = useCallback(async () => {
    try {
      setStatus(await window.proxyApi.httpLocalServerProxy('/user/status'))
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
    window.proxyApi
      .httpLocalServerProxy<UserInfo>('/user/now')
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
