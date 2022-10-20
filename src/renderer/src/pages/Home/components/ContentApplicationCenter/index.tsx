import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Button, Input, MessagePlugin } from 'tdesign-react'
import { Tabs } from 'antd'
import { AddIcon, SearchIcon, AppIcon, FormatHorizontalAlignCenterIcon } from 'tdesign-icons-react'
import 'antd/dist/antd.css'
import './index.scss'
import { AppDesktop } from './appDesktop'
import Loading from '@renderer/components/Loading'

export const ContentApplicationCenter: FC = () => {
  const applicationCenterEle = useRef<HTMLDivElement>(null)

  const [loadingDesc, setLoadingDesc] = useState<string>('')
  const [openedAppIdList, setOpenedAppIdList] = useState<string[]>(window.app.getOpenedIdList())

  useEffect(() => {
    window.app.restore()
    return () => {
      window.app.hangUp()
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const appOpenedNoticeEvent = (id: string, status: 'open' | 'close') => {
      setOpenedAppIdList((idList) => {
        const index = idList.indexOf(id)
        if (status === 'open') {
          if (index === -1) {
            idList.push(id)
          } else {
            return idList
          }
        } else {
          if (index >= 0) {
            idList.splice(index, 1)
          }
        }
        return [...idList]
      })
    }

    window.app.listenOpenStatusNotice(appOpenedNoticeEvent)
    return () => {
      window.app.removeListenOpenStatusNotice(appOpenedNoticeEvent)
    }
  }, [])

  const appOpen = useCallback(async (app: AppInfo) => {
    setLoadingDesc('正在打开应用...')
    const wrapperEle = applicationCenterEle.current!
    try {
      window.app.showOrLoad(app.id, app.url, {
        x: wrapperEle.offsetLeft + 7,
        y: wrapperEle.offsetTop + 6,
        width: wrapperEle.clientWidth,
        height: wrapperEle.clientHeight,
        widthOffset: -1
      })
    } catch (e) {
      MessagePlugin.error('应用加载失败')
    } finally {
      setLoadingDesc('')
    }
  }, [])

  return (
    <div className="application-center match-parent" ref={applicationCenterEle}>
      <div className="search">
        <Input
          prefixIcon={<SearchIcon />}
          style={{ width: 280 }}
          placeholder="请输入要搜索的应用名称"
        />
      </div>
      <div className="application-container">
        <Tabs
          style={{ height: '100%', paddingTop: 8 }}
          tabPosition="left"
          tabBarExtraContent={{
            right: (
              <Button variant="text" icon={<AddIcon />}>
                添加分类
              </Button>
            )
          }}
          items={[
            {
              label: (
                <span className="app-item">
                  <AppIcon />
                  <span>全部</span>
                </span>
              ),
              key: 'all',
              children: (
                <AppDesktop onOpen={appOpen} openedAppIdList={openedAppIdList} showContextMenu />
              )
            }, // 务必填写 key
            {
              label: (
                <span className="app-item">
                  <FormatHorizontalAlignCenterIcon />
                  <span>正在使用</span>
                </span>
              ),
              key: 'item-2',
              children: '内容 1'
            } // 务必填写 key
          ]}
        />
      </div>
      {loadingDesc && <Loading desc={loadingDesc} />}
    </div>
  )
}

export default ContentApplicationCenter
