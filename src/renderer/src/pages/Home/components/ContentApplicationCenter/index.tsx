import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Input, InputValue, MessagePlugin } from 'tdesign-react'
import { Tabs } from 'antd'
import {
  AddIcon,
  SearchIcon,
  AppIcon,
  FormatHorizontalAlignCenterIcon,
  RollbackIcon,
  JumpIcon,
  PoweroffIcon
} from 'tdesign-icons-react'
import 'antd/dist/antd.css'
import './index.scss'
import { AppDesktop } from './appDesktop'
import Loading from '@renderer/components/Loading'
import AppOpenTitle from '@renderer/components/AppOpenTitle'

export const ContentApplicationCenter: FC = () => {
  const applicationCenterEle = useRef<HTMLDivElement>(null)

  const [loadingDesc, setLoadingDesc] = useState<string>('')
  const [openedAppIdList, setOpenedAppIdList] = useState<string[]>(window.app.getOpenedIdList())
  const [nowOpenApp, setNowOpenApp] = useState<AppInfo | undefined>(undefined)
  const [keyword, setKeyword] = useState<string | undefined>(undefined)

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
        const targetIdList = [...idList]
        const index = idList.indexOf(id)
        if (status === 'open') {
          if (index === -1) {
            targetIdList.push(id)
          } else {
            return idList
          }
        } else {
          if (index >= 0) {
            targetIdList.splice(index, 1)
          } else {
            return idList
          }
        }
        return targetIdList
      })
    }

    const listenId = 'appStatusListener'
    window.app.listenOpenStatusNotice(listenId, appOpenedNoticeEvent)
    return () => {
      window.app.removeListenOpenStatusNotice(listenId)
    }
  }, [])

  const appOpen = useCallback(async (app: AppInfo) => {
    setLoadingDesc('正在打开应用...')
    const wrapperEle = applicationCenterEle.current!
    try {
      await window.app.openApp(
        app.id,
        app.url,
        {
          x: wrapperEle.offsetLeft + 7,
          y: wrapperEle.offsetTop + 6 + 40,
          width: wrapperEle.clientWidth,
          height: wrapperEle.clientHeight - 40,
          widthOffset: -1
        },
        app.inside
      )
      setNowOpenApp(app)
    } catch (e) {
      MessagePlugin.error('应用加载失败')
    } finally {
      setLoadingDesc('')
    }
  }, [])

  const onAppClose = useCallback(async () => {
    if (!nowOpenApp) {
      return
    }
    await window.app.closeApp(nowOpenApp.id)
    setNowOpenApp(undefined)
  }, [nowOpenApp])

  const appOpenTitleStarBtns = useMemo(() => {
    return (
      <Button
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        onClick={async () => {
          window.app.hangUp()
          setNowOpenApp(undefined)
        }}
        title="返回桌面"
        shape="square"
        variant="text"
        icon={<RollbackIcon size="22px" />}
      />
    )
  }, [])

  const appOpenTitleEndBtns = useMemo(() => {
    return [
      <Button
        title="弹出"
        key="jump"
        shape="square"
        variant="text"
        icon={<JumpIcon size="22px" />}
      />,
      <Button
        onClick={onAppClose}
        title="关闭"
        key="close"
        shape="square"
        variant="text"
        theme="danger"
        icon={<PoweroffIcon size="22px" />}
      />
    ]
  }, [onAppClose])

  const appDesktopTabs = useMemo(() => {
    const result = [
      {
        label: (
          <span className="app-item">
            <AppIcon />
            <span>全部</span>
          </span>
        ),
        key: 'default',
        children: (
          <AppDesktop
            keyword={keyword}
            onOpen={appOpen}
            openedAppIdList={openedAppIdList}
            showContextMenu
          />
        )
      } // 务必填写 key
    ]

    if (openedAppIdList.length > 0) {
      result.push({
        label: (
          <span className="app-item">
            <FormatHorizontalAlignCenterIcon />
            <span>正在使用</span>
          </span>
        ),
        key: 'item-2',
        children: (
          <AppDesktop
            keyword={keyword}
            onOpen={appOpen}
            openedAppIdList={openedAppIdList}
            onlyShowOpened
          />
        )
      })
    }

    return result
  }, [openedAppIdList, keyword])

  const searchInputOnChange = useCallback((val: InputValue) => {
    setKeyword(val.toString())
  }, [])

  return (
    <div className="application-center match-parent" ref={applicationCenterEle}>
      {nowOpenApp && (
        <AppOpenTitle
          title={nowOpenApp.name}
          endEle={appOpenTitleEndBtns}
          startEle={appOpenTitleStarBtns}
        />
      )}
      <div className="search">
        <Input
          onChange={searchInputOnChange}
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
          items={appDesktopTabs}
        />
      </div>
      {loadingDesc && <Loading desc={loadingDesc} />}
    </div>
  )
}

export default ContentApplicationCenter
