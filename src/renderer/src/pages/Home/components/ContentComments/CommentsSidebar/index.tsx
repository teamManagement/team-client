import { AppInfo, UserInfo } from '@byzk/teamwork-sdk'
import { api, remoteCache, insideDb, ChatGroupInfo } from '@byzk/teamwork-inside-sdk'
import MessageCard from '@renderer/components/MessageCard'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { Actions } from './Actions'
import { DataSourceMeta, Search } from './Search'
import { SearchResult } from '@renderer/components/SearchInput/searchInput'
import { useSearchParams } from 'react-router-dom'

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
  _id: string
  _rev?: string
}

export interface CommentsSidebarProps {
  activeMessageCardChange?(msgInfo?: MessageInfo): void
}

export const CommentsSidebar: FC<CommentsSidebarProps> = ({ activeMessageCardChange }) => {
  const [searchParams] = useSearchParams()

  const queryCurrentMessage = useCallback((messageList: MessageInfo[]) => {
    try {
      if (!messageList || messageList.length <= 0) {
        return undefined
      }
      const currentMsg = insideDb.sync.get<MessageInfo>(currentMessageCardDbKey)
      if (!currentMsg) {
        return undefined
      }
      if (messageList.findIndex((v) => v.id === currentMsg.id) < 0) {
        return undefined
      }
      return currentMsg
    } catch (e) {
      return undefined
    }
  }, [])

  const queryMessageDataList = useCallback(() => {
    try {
      const messageList = insideDb.sync.index.find<MessageInfo>({
        selector: { 'indexInfo.dataType': 'userMessage', 'indexInfo.updateAt': { $gte: null } },
        sort: [{ 'indexInfo.updateAt': 'desc' }]
      }).docs
      return messageList
    } catch (e) {
      console.log(e)
      return []
    }
  }, [])

  const [messageDataList, setMessageDataList] = useState<MessageInfo[]>(queryMessageDataList())
  const [currentMessage, setCurrentMessage] = useState<MessageInfo | undefined>(
    queryCurrentMessage(messageDataList)
  )

  const [appList, setAppList] = useState<AppInfo[]>([])
  const [userList, setUserList] = useState<UserInfo[]>([])

  const filterMessageDataList = useCallback((messageIdList: { id: string; _id?: string }[]) => {
    const msgIdList = messageIdList.map((m) => m.id)
    setMessageDataList((l) => {
      let isUpdate = false
      for (let i = l.length - 1; i >= 0; i--) {
        const _msg = l[i]
        if (msgIdList.includes(_msg.id)) {
          continue
        }

        isUpdate = true
        msgIdList.splice(i, 1)
        // insideDb.sync.remove(_msg._id || _msg.id)
      }
      if (isUpdate) {
        return [...l]
      }
      return l
    })
  }, [])

  const queryAppList = useCallback(async () => {
    try {
      const appList =
        (await api.proxyHttpLocalServer<AppInfo[]>('services/resources/app/list', {
          timeout: -1
        })) || []
      setAppList(appList)
      filterMessageDataList(appList)
    } catch (e) {
      setTimeout(queryAppList, 5000)
    }
  }, [])

  const queryUserList = useCallback(async () => {
    try {
      const userList = await remoteCache.userList()
      setUserList(userList)
      // filterMessageDataList(userList)
    } catch (e) {
      setTimeout(queryUserList, 5000)
    }
  }, [])

  useEffect(() => {
    // queryMessageDataList()
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
          },
          _id: (r as any)._id,
          _rev: (r as any)._rev
        } as any

        try {
          msg._id = msg._id || msg.id
          const res = insideDb.sync.put(msg)
          msg._id = res.id
          msg._rev = res.rev
        } catch (e) {
          console.error('更新缓存数据失败: ', JSON.stringify(e))
        }

        messageDataList.unshift(msg)
        setCurrentMessage(msg)
        return [...messageDataList]
      })
    },
    [messageDataList]
  )

  useEffect(() => {
    const userId = searchParams.get('_u')
    if (!userId || !userList || userList.length === 0) {
      return
    }
    const index = userList.findIndex((v) => v.id === userId)
    if (index === -1) {
      return
    }

    let desc = ''
    const userInfo = userList[index]
    if (userInfo.orgList) {
      for (const o of userInfo.orgList) {
        desc += o.org.name + ','
      }
    }

    if (desc.length > 0) {
      desc = desc.substring(0, desc.length - 1)
      desc = '部门: ' + desc
    }
    onSearchResultItemClick({
      id: userInfo.id,
      name: `${userInfo.name}( ${userInfo.username} )`,
      typeId: 'users',
      icon: userInfo.icon,
      iconName: userInfo.name,
      desc,
      metaData: {
        type: 'users',
        sourceName: userInfo.name,
        sourceData: userInfo
      } as any
    })

    searchParams.set('_u', '')
  }, [userList, searchParams])

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

    activeMessageCardChange && activeMessageCardChange(currentMessage)
    if (!currentMessage) {
      return
    }

    insideDb.sync.put({
      ...currentMessage,
      indexInfo: undefined,
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
