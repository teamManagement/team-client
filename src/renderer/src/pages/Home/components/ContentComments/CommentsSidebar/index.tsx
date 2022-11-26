import { AppInfo, UserInfo } from '@byzk/teamwork-sdk'
import { api, remoteCache, insideDb, ChatGroupInfo } from '@byzk/teamwork-inside-sdk'
import MessageCard from '@renderer/components/MessageCard'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { Actions } from './Actions'
import { DataSourceMeta, Search } from './Search'
import { SearchResult } from '@renderer/components/SearchInput/searchInput'

const currentMessageCardDbKey = 'current_message_card'
export interface MessageInfo {
  id: string
  type: 'users' | 'groups' | 'apps'
  name: string
  desc?: string
  icon?: string
  endMessageTime?: string
  endMessage?: string
  sourceData: UserInfo | AppInfo | ChatGroupInfo
  indexInfo: {
    dataType: 'userMessage'
    updateAt: Date
  }
}

export const CommentsSidebar: FC = () => {
  const [currentMessage, setCurrentMessage] = useState<MessageInfo | undefined>(undefined)
  const [appList, setAppList] = useState<AppInfo[]>([])
  const [userList, setUserList] = useState<UserInfo[]>([])

  const [messageDataList, setMessageDataList] = useState<MessageInfo[]>([])

  const queryMessageDataList = useCallback(() => {
    try {
      const queryData = insideDb.sync.index.find<MessageInfo>({
        selector: { 'indexInfo.dataType': 'userMessage', 'indexInfo.updateAt': { $gte: null } },
        sort: [{ 'indexInfo.updateAt': 'desc' }]
      })
      setMessageDataList(queryData.docs)
    } catch (e) {
      //nothing
    }
  }, [])

  const queryAppList = useCallback(async () => {
    try {
      setAppList(
        (await api.proxyHttpLocalServer<AppInfo[]>('services/resources/app/list', {
          timeout: -1
        })) || []
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
    queryMessageDataList()
    // queryCurrentMessage()
    queryAppList()
    queryUserList()
  }, [queryAppList])

  const onSearchResultItemClick = useCallback(
    (r: SearchResult<DataSourceMeta>) => {
      setMessageDataList((messageList) => {
        for (const messageInfo of messageList) {
          if (r.id === messageInfo.id) {
            setCurrentMessage(messageInfo)
            return messageDataList
          }
        }

        if (!r.metaData) {
          return messageDataList
        }

        const msg: MessageInfo = {
          id: r.id,
          name: r.metaData.sourceName || r.name,
          desc: r.desc,
          icon: r.icon,
          type: r.typeId as any,
          sourceData: r.metaData.sourceData,
          indexInfo: {
            dataType: 'userMessage',
            updateAt: new Date()
          }
        }

        try {
          insideDb.sync.post(msg)
        } catch (e) {
          console.error('更新缓存数据失败: ', JSON.stringify(e))
        }

        setCurrentMessage(msg)
        messageDataList.unshift(msg)
        return [...messageDataList]
      })
    },
    [messageDataList]
  )

  const messageClick = useCallback((info: MessageInfo) => {
    setCurrentMessage(info)
  }, [])

  const messageItemElements = useMemo(() => {
    if (messageDataList.length <= 0) {
      return (
        <div
          style={{
            width: '100%',
            fontSize: 16,
            textAlign: 'center',
            marginTop: 18,
            fontWeight: 'bolder'
          }}
        >
          暂无联系人
        </div>
      )
    }
    return messageDataList.map((m) => {
      return (
        <div key={m.id} className="item">
          <MessageCard
            onClick={messageClick}
            info={m}
            active={currentMessage && m.id === currentMessage.id}
          />
        </div>
      )
    })
  }, [messageDataList, currentMessage])

  useEffect(() => {
    try {
      insideDb.sync.remove(currentMessageCardDbKey)
    } catch (e) {
      //nothing
    }

    if (!currentMessage) {
      return
    }

    insideDb.sync.put({
      ...currentMessage,
      _id: currentMessageCardDbKey,
      _rev: undefined
    })
  }, [currentMessage])

  return (
    <div className="comments-sidebar">
      <Search apps={appList} users={userList} onSearchResultItemClick={onSearchResultItemClick} />
      <Actions />
      <div className="contact-list">
        <div style={{ width: 272, height: 38, marginBottom: 18 }}>{messageItemElements}</div>
      </div>
    </div>
  )
}
