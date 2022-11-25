import { AppInfo, UserInfo } from '@byzk/teamwork-sdk'
import { api, remoteCache } from '@byzk/teamwork-inside-sdk'
import MessageCard from '@renderer/components/MessageCard'
import { FC, useCallback, useEffect, useState } from 'react'
import { Actions } from './Actions'
import { Search } from './Search'

export const CommentsSidebar: FC = () => {
  const [appList, setAppList] = useState<AppInfo[]>([])
  const [userList, setUserList] = useState<UserInfo[]>([])

  const queryAppList = useCallback(async () => {
    try {
      setAppList(
        await api.proxyHttpLocalServer<AppInfo[]>('services/resources/app/list', { timeout: -1 })
      )
    } catch (e) {
      setTimeout(queryAppList, 5000)
    }
  }, [])

  const queryUserList = useCallback(async () => {
    try {
      setUserList(await remoteCache.userList())
    } catch (e) {
      setTimeout(queryUserList, 5000)
    }
  }, [])

  useEffect(() => {
    queryAppList()
    queryUserList()
  }, [queryAppList])

  return (
    <div className="comments-sidebar">
      <Search apps={appList} users={userList} />
      <Actions />
      <div className="contact-list">
        <div style={{ width: 272, height: 38, marginBottom: 18 }}>
          <MessageCard />
        </div>
      </div>
    </div>
  )
}
