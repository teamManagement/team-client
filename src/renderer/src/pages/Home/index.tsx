import { FC, useCallback, useEffect, useState } from 'react'
import { current } from '@byzk/teamwork-sdk'
import { id, api } from '@byzk/teamwork-inside-sdk'
import Nav from './components/Nav'
import Content from './components/Content'
import WindowToolbar from './components/WindowToolbar'
import './index.scss'
import React from 'react'
import { UserChatMsg } from './components/ContentComments/commentsContent/vos'
import AsyncLock from 'async-lock'
import { ChatMessageCardHookReturnType, useChatMessageOperation } from './hooks'

const lock = new AsyncLock()

export interface HomeContextType {
  /**
   * 在线用户ID列表
   */
  onlineUserIdList: string[]
  /**
   * messageOperation 消息操作
   */
  messageOperation: ChatMessageCardHookReturnType
  /**
   * 获取最后的未读消息
   * @returns 用户消息
   */
  getUnreadChatMsg(): Promise<UserChatMsg>
  /**
   * 清空未读消息获取方法
   */
  clearUnreadFn(): void
  /**
   * 打开消息卡片
   */
  // openMessageCard(): void
  // /**
  //  * 注册用户状态变更处理器
  //  * @param id 处理器id
  //  */
  // registerOnlineUserChange(id: string, handler: OnlineUserChangeHandler): void
  // /**
  //  * 注销用户状态变更处理器
  //  * @param id 处理器ID
  //  */
  // unRegisterOnlineUserChange(id: string): void
}

const homeContextInitValue = {
  onlineUserIdList: [],
  getUnreadChatMsg() {
    return {} as any
  },
  clearUnreadFn() {
    //nothing
  },
  messageOperation: {} as any
  // onlineUserIdList: current.onlineUserIdList
  // registerOnlineUserChange: current.registerOnlineUserChange,
  // unRegisterOnlineUserChange: current.unRegisterOnlineUserChange
} as HomeContextType

let unreadChatMsgFn: ((chatMsg: UserChatMsg) => void) | undefined = undefined

export const HomeContext = React.createContext<HomeContextType>(homeContextInitValue)

export const Home: FC = () => {
  const messageOperation = useChatMessageOperation()

  // const [, setUnreadFn] = useState<((chatMsg: UserChatMsg) => void) | undefined>(undefined)
  const getUnreadChatMsg = useCallback(async () => {
    return new Promise<UserChatMsg>((resolve) => {
      lock.acquire('serverMsgHandlerSetting', (done) => {
        try {
          console.log('设置resolve')
          unreadChatMsgFn = resolve
        } finally {
          done()
        }
      })
    })
  }, [])

  const clearUnreadFn = useCallback(() => {
    lock.acquire('serverMsgHandlerSetting', (done) => {
      try {
        unreadChatMsgFn && unreadChatMsgFn(undefined as any)
        unreadChatMsgFn = undefined
      } finally {
        done()
      }
    })
  }, [])

  useEffect(() => {
    const fnId = api.registerServerMsgHandler((data) => {
      if (data.cmdCode !== 6) {
        return
      }

      // insideDb.;
      lock.acquire('serverMsgHandler', async (done) => {
        try {
          for (;;) {
            if (
              await new Promise<boolean>((resolve) => {
                if (!unreadChatMsgFn) {
                  setTimeout(() => {
                    resolve(false)
                  }, 500)
                  return
                }

                unreadChatMsgFn(data.data as any)
                resolve(true)
              })
            ) {
              break
            }
          }
        } finally {
          done()
        }
      })
    })
    return () => {
      console.log('退出...')
      api.removeServerMsgHandler(fnId)
    }
  }, [])

  const [onlineUserIdList, setOnlineUserIdList] = useState<string[]>(
    current.onlineUserIdList() || []
  )

  useEffect(() => {
    const handlerId = id.uuid()
    current.registerOnlineUserChange(handlerId, (_status, _userId, userIdList) => {
      setOnlineUserIdList(userIdList)
    })
    return () => {
      current.unRegisterOnlineUserChange(handlerId)
    }
  }, [])

  return (
    <HomeContext.Provider
      value={{
        messageOperation,
        onlineUserIdList,
        getUnreadChatMsg,
        clearUnreadFn
      }}
    >
      <div className="home match-parent">
        <WindowToolbar />
        <div className="content">
          <Nav />
          <Content />
        </div>
      </div>
    </HomeContext.Provider>
  )
}

export default Home
