import { useCallback, useEffect, useState } from 'react'

export function useUserStatus(): 'online' | 'offline' {
  const [status, setStatus] = useState<'online' | 'offline'>('offline')
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const fn = (data: TcpTransferInfo<any>) => {
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
