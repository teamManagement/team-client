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

const lock = new AsyncLock()

export interface HomeContextType {
  /**
   * 在线用户ID列表
   */
  onlineUserIdList: string[]
  /**
   * 获取最后的未读消息
   * @returns 用户消息
   */
  getUnreadChatMsg(): Promise<UserChatMsg>
  /**
   * 清空未读消息获取方法
   */
  clearUnreadFn(): void
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
  }
  // onlineUserIdList: current.onlineUserIdList
  // registerOnlineUserChange: current.registerOnlineUserChange,
  // unRegisterOnlineUserChange: current.unRegisterOnlineUserChange
} as HomeContextType

let unreadChatMsgFn: ((chatMsg: UserChatMsg) => void) | undefined = undefined

export const HomeContext = React.createContext<HomeContextType>(homeContextInitValue)

export const Home: FC = () => {
  // const [, setUnreadFn] = useState<((chatMsg: UserChatMsg) => void) | undefined>(undefined)
  const getUnreadChatMsg = useCallback(async () => {
    return new Promise<UserChatMsg>((resolve) => {
      lock.acquire('serverMsgHandler', (done) => {
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
    lock.acquire('serverMsgHandler', (done) => {
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

      lock.acquire('serverMsgHandler', async (done) => {
        try {
          for (;;) {
            if (
              await new Promise<boolean>((resolve) => {
                console.log(unreadChatMsgFn)
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
    <HomeContext.Provider value={{ onlineUserIdList, getUnreadChatMsg, clearUnreadFn }}>
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
