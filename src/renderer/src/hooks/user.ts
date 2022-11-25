import { useCallback, useEffect, useState } from 'react'
import { api, TcpTransferInfo, TcpTransferCmdCode } from '@byzk/teamwork-inside-sdk'
import { UserInfo, current } from '@byzk/teamwork-sdk'

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
  const [userInfo] = useState<UserInfo | undefined>(current.userInfo)
  return userInfo
}
