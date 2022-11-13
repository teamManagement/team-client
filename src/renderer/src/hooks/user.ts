import { useCallback, useEffect, useState } from 'react'
import { MessagePlugin } from 'tdesign-react'
import { api, TcpTransferInfo, TcpTransferCmdCode } from '@byzk/teamwork-inside-sdk'
import { UserInfo } from '@byzk/teamwork-sdk'

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
    const fnId = api.registerServerMsgHandler(fn)
    return () => {
      api.removeServerMsgHandler(fnId)
    }
  }, [])
  const queryUserStatus = useCallback(async () => {
    try {
      setStatus(await api.proxyHttpLocalServer('/user/status'))
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
    api
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
