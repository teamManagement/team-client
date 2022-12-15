import { FC, useEffect, useState } from 'react'
import { current } from '@byzk/teamwork-sdk'
import { id } from '@byzk/teamwork-inside-sdk'
import Nav from './components/Nav'
import Content from './components/Content'
import WindowToolbar from './components/WindowToolbar'
import './index.scss'
import React from 'react'

export interface HomeContextType {
  /**
   * 在线用户ID列表
   */
  onlineUserIdList: string[]
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
  onlineUserIdList: []
  // onlineUserIdList: current.onlineUserIdList
  // registerOnlineUserChange: current.registerOnlineUserChange,
  // unRegisterOnlineUserChange: current.unRegisterOnlineUserChange
} as HomeContextType

export const HomeContext = React.createContext<HomeContextType>(homeContextInitValue)

export const Home: FC = () => {
  useEffect(() => {
    ;(window as any).teamworkSDK.notification.showWithTemplate({
      title: '测试notificationApi',
      body: '我是测试的内容',
      bodyClick() {
        console.log('----------')
      },
      closable: true,
      duration: -1
    })
  }, [])
  //   const location = useLocation()
  //   const transitions = useTransition(location, {
  //     from: { opacity: 0, transform: 'translate3d(-100px, 0, 0)' },
  //     enter: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  //     leave: { opacity: 0, transform: 'translate3d(-100px, 0, 1)' }
  //   })

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
    <HomeContext.Provider value={{ onlineUserIdList }}>
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
