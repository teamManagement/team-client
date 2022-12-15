import {
  screen,
  BrowserView,
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  IpcMainInvokeEvent,
  Rectangle,
  session
} from 'electron'
import AsyncLock from 'async-lock'
import { SettingWindow } from '../windows/common'
import { WinNameEnum } from '../current'
import { ipcEventPromiseWrapper } from '../tools/ipc'
import { uniqueId } from '../security/random'
import { clearTimeout } from 'timers'
import { PRELOAD_JS_INSIDE, PRELOAD_JS_NOTIFICATION } from '../consts'
import { is, optimizer } from '@electron-toolkit/utils'

const _lock = new AsyncLock()

export interface NotificationBtnInfo {
  /**
   * 显示文字
   */
  title: string | TemplateObj
  /**
   * 组件风格，依次为默认色、品牌色、危险色、警告色、成功色
   */
  theme?: 'default' | 'primary' | 'danger' | 'warning' | 'success'
  /**
   * 按钮形式，基础、线框、虚线、文字
   * @default base
   */
  variant?: 'base' | 'outline' | 'dashed' | 'text'
  /**
   * 单击
   */
  click?(): void
  /**
   * 双击
   */
  doubleClick?(): void
}

type PositionFlag =
  | 'topCenter'
  | 'topLeft'
  | 'topRight'
  | 'centerLeft'
  | 'center'
  | 'centerRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight'
  | 'full'
  | 'forceFull'

const _positionHeight: {
  [key: string]: number
} = {
  topCenter: 0,
  topLeft: 0,
  topRight: 0,
  centerLeft: 0,
  center: 0,
  centerRight: 0,
  bottomLeft: 0,
  bottomCenter: 0,
  bottomRight: 0,
  full: 0,
  forceFull: 0
}

export interface NotificationBaseInfo {
  /**
   * 内部类型
   */
  _type?: 'template' | 'custom'
  /**
   * 发送者的窗体ID
   */
  _senderId?: number
  /**
   * 监听显示
   */
  onShow?(): void
  /**
   * 监听关闭
   */
  onClose?(): void
  /**
   * 发生错误
   * @param errMsg 错误信息
   */
  onError?(errMsg: string): void
  /**
   * 位置
   */
  position?: PositionFlag | { x?: number; y?: number }

  /**
   * 大小, 默认： {width: 400, height: 'auto' || 200},
   * 当type为template时 height默认为auto, 其他则为200
   */
  size?: { width?: number; height?: number }
}

export interface TemplateRenderDataBase {
  updateData(data: any): void
  updateTml(tmlObj: TemplateObj): void
  click(): void
  doubleClick(): void
  data: any
}

export interface TemplateObj {
  /**
   * 模板字符串
   */
  tml: string
  /**
   * 数据
   */
  data?: any
  /**
   * 是否重复
   */
  repeat?: false | number
  /**
   * 重复间隔单位ms
   */
  repeatInterval?: number
}

/**
 * 通知信息
 */
export interface NotificationTemplateInfo extends NotificationBaseInfo {
  /**
   * 标题
   */
  title?: string | TemplateObj
  /**
   * title单机
   */
  titleClick?(): void
  /**
   * 内容
   */
  body?: string
  /**
   * body被点击
   */
  bodyClick?(): void
  /**
   * 图标路径
   */
  icon?: string
  /**
   * 主题样式
   */
  theme?: 'info' | 'success' | 'warning' | 'error'
  /**
   * 超时时间, 默认5000（5s）, 填入0为永不超时需要手动关闭
   */
  duration?: number
  /**
   * 是否可以手动关闭, 当超时时间<=0时此项永远为true
   */
  closable?: boolean
  /**
   * 按钮
   */
  btns?: NotificationBtnInfo[]
}

export interface NotificationCustomInfo extends NotificationBaseInfo {
  /**
   * 自定义内容URL
   */
  url?: string
}

/**
 * 通知的事件名称
 */
enum NotificationEventName {
  /**
   * 创建并展示消息通知
   */
  SHOW = 'ipc_NOTIFICATION_SHOW',
  /**
   * 渲染进程调用，触发通知窗体显示
   */
  SHOW_CONTENT = 'ipc_NOTIFICATION_SHOW_CONTENT',
  /**
   * 通知消息内容获取
   */
  GET_NOTIFICATION = 'ipc_NOTIFICATION_INFO_GET',
  /**
   * 事件调用
   */
  EVENT_NOTIFICATION = 'ipc_NOTIFICATION_EVENT_CALL',
  /**
   * 通知消息类型获取
   */
  GET_NOTIFICATION_TYPE = 'ipc_NOTIFICATION_TYPE_GET'
}

const _maxBwSize = 8

const _browserWindowPool: BrowserWindow[] = []
const _nowOpenedNotificationWin: { [key: string]: BrowserWindow[] } = {
  topCenter: [],
  topLeft: [],
  topRight: [],
  centerLeft: [],
  center: [],
  centerRight: [],
  bottomLeft: [],
  bottomCenter: [],
  bottomRight: [],
  full: [],
  forceFull: [],
  noRest: []
}

export function initNotificationEvent(): void {
  ipcMain.handle(NotificationEventName.SHOW, ipcEventPromiseWrapper(_showNotificationIpcEvent))
  ipcMain.handle(
    NotificationEventName.SHOW_CONTENT,
    ipcEventPromiseWrapper(_showNotificationContent)
  )
  ipcMain.addListener(NotificationEventName.GET_NOTIFICATION, (event: IpcMainEvent) => {
    const noticeInfo = (event.sender as any)._info as NotificationTemplateInfo
    const returnValue = JSON.parse(JSON.stringify(noticeInfo) || '{}') as any
    if (typeof noticeInfo.bodyClick === 'function') {
      returnValue.bodyClick = true
    }

    if (typeof noticeInfo.titleClick === 'function') {
      returnValue.titleClick = true
    }

    event.returnValue = returnValue
  })
  ipcMain.handle(
    NotificationEventName.EVENT_NOTIFICATION,
    ipcEventPromiseWrapper(_eventCallNotification)
  )
}

function _settingNotificationBounds(
  win: BrowserWindow,
  size: { width: number; height: number },
  position?: PositionFlag | { x?: number; y?: number }
): void {
  if (typeof position === 'undefined') {
    position = 'bottomRight'
  }

  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())

  const workArea = display.workArea

  if (position === 'full' || position === 'forceFull') {
    win.setBounds({ x: 0, y: 0, width: workArea.width, height: workArea.height })
    win.setFullScreen(true)
    if (position === 'forceFull') {
      win.setAlwaysOnTop(true)
    }
    _nowOpenedNotificationWin['noRest'].push(win)
    ;(win.webContents as any)._position = 'noRest'
    return
  }

  win.setAlwaysOnTop(true)
  const bounds: Rectangle = { ...size } as Rectangle
  if (typeof position === 'object') {
    const targetX = parseInt(position.x + '')
    const targetY = parseInt(position.y + '')
    if (isNaN(targetX) && isNaN(targetY)) {
      position = 'bottomRight'
    } else {
      if (!isNaN(targetX)) {
        bounds.x = targetX
      } else {
        bounds.x = 0
      }

      if (!isNaN(targetY)) {
        bounds.y = targetY
      } else {
        bounds.y = 0
      }

      win.setBounds(bounds)
      _nowOpenedNotificationWin['noRest'].push(win)
      ;(win.webContents as any)._position = 'noRest'
      return
    }
  }

  let positionHeight = _positionHeight[position]
  if (typeof positionHeight === 'undefined') {
    positionHeight = _positionHeight['bottomRight']
    position = 'bottomRight'
  }

  const leftX = 0
  const centerX = parseInt((workArea.width - size.width) / 2 + '')
  const rightX = parseInt(workArea.width - size.width + '')

  const topY = 0
  const centerY = parseInt((workArea.height - size.height) / 2 + '')
  const bottomY = parseInt(workArea.height - size.height + '')

  const positionCase = position.toLocaleLowerCase()

  if (positionCase.startsWith('top')) {
    bounds.y = topY + positionHeight
    _positionHeight[position] += bounds.height
    _nowOpenedNotificationWin[position].push(win)
    ;(win.webContents as any)._position = position
  } else if (position.startsWith('bottom')) {
    bounds.y = bottomY - positionHeight
    _positionHeight[position] += bounds.height
    _nowOpenedNotificationWin[position].push(win)
    ;(win.webContents as any)._position = position
  } else {
    bounds.y = centerY
    _nowOpenedNotificationWin['noRest'].push(win)
  }

  if (positionCase.endsWith('left')) {
    bounds.x = leftX
  } else if (positionCase.endsWith('right')) {
    bounds.x = rightX
  } else {
    bounds.x = centerX
  }

  win.setBounds(bounds)
}

async function _eventCallNotification(
  event: IpcMainInvokeEvent,
  eventType: 'title' | 'body' | 'btn',
  eventFnName: string,
  btnIndex?: number
): Promise<void> {
  const templateInfo = (event.sender as any)._info as NotificationTemplateInfo
  if (!templateInfo || !eventType || !eventFnName) {
    return
  }

  let fnReturn: void | Promise<void> | undefined = undefined

  switch (eventType) {
    case 'title':
      if (eventFnName !== 'click') {
        return
      }

      if (!templateInfo.titleClick) {
        return
      }

      fnReturn = templateInfo.titleClick()
      break
    case 'body':
      if (eventFnName !== 'click') {
        return
      }

      if (!templateInfo.bodyClick) {
        return
      }

      fnReturn = templateInfo.bodyClick()
      break
    case 'btn':
      if (!templateInfo.btns) {
        return
      }
      if (eventFnName !== 'click' && eventFnName !== 'doubleClock') {
        return
      }

      if (typeof btnIndex !== 'number' || btnIndex < 0 || btnIndex > templateInfo.btns.length - 1) {
        return
      }
      fnReturn = templateInfo.btns[btnIndex][eventFnName]()
      break
    default:
      return
  }

  if (fnReturn instanceof Promise) {
    await fnReturn
  }
}

async function _showNotificationContent(event: IpcMainInvokeEvent, height?: number): Promise<void> {
  _lock.acquire('bw', (done) => {
    try {
      const bw = BrowserWindow.fromWebContents(event.sender)
      if (!bw) {
        return
      }

      const sender = event.sender as any
      if (sender._showOk) {
        return
      }

      let size: { width: number; height: number } = sender._info.size
      if (typeof size === 'undefined') {
        size = {} as any
      }

      if (typeof size.width === 'undefined' || size.width <= 0) {
        size.width = 400
      }

      if (typeof size.height === 'undefined' || size.height <= 0) {
        size.height = height || 173
      }
      // size.height += 28

      const notificationInfo = sender._info as NotificationBaseInfo
      const position = notificationInfo.position

      _settingNotificationBounds(bw, size, position)

      sender._showOk = true
      let duration: number | undefined = sender._info.duration
      if (typeof duration === 'undefined') {
        duration = 5000
      }

      if (duration > 0) {
        sender._durationId = setTimeout(() => {
          bw.close()
        }, duration)
      }
      bw.show()
      bw.focus()
      // bw.setAlwaysOnTop(true)
    } catch (e) {
      console.log(e)
    } finally {
      done()
    }
  })
}

function _showNotificationIpcEvent(
  _event: IpcMainInvokeEvent,
  type: 'template' | 'custom',
  notificationInfo: NotificationTemplateInfo & NotificationCustomInfo
): Promise<string> {
  return showNotification(type, notificationInfo)
}

/**
 *
 * 显示消息通知
 *
 * @param type 类型:
 *             template: 模板, 根据固定选项弹出默认通知
 *             custom: 自定义, 传入 customUrl弹窗将加载远程的url页面
 * @param notificationInfo 弹窗信息
 * @returns
 */
export function showNotification(
  type: 'template' | 'custom',
  notificationInfo: NotificationTemplateInfo & NotificationCustomInfo
): Promise<string> {
  switch (type) {
    case 'custom':
      if (typeof notificationInfo.url === 'undefined') {
        throw new Error('自定义弹窗的URL不能为空')
      }
      break
    case 'template':
      if (
        typeof notificationInfo.title === 'undefined' &&
        typeof notificationInfo.body === 'undefined'
      ) {
        throw new Error('弹窗模板中必须具有title或body')
      }

      if (typeof notificationInfo.duration === 'undefined') {
        notificationInfo.duration = 5000
      }

      if (notificationInfo.duration < 0) {
        notificationInfo.duration = 0
      }

      if (!notificationInfo.closable && notificationInfo.duration <= 0) {
        notificationInfo.duration = 5000
      }

      break
    default:
      return Promise.reject(new Error('不支持的通知类型: ' + type))
  }

  if (typeof notificationInfo.position === 'undefined') {
    notificationInfo.position = 'bottomRight'
  }

  notificationInfo._type = type

  return _lock.acquire('bw', async (done) => {
    const bwId = uniqueId()
    const sess = session.fromPartition(bwId)
    sess.setPreloads([PRELOAD_JS_INSIDE])
    let bw = _browserWindowPool.shift()
    if (!bw) {
      bw = await SettingWindow(
        WinNameEnum.NONE,
        {
          resizable: false,
          maximizable: false,
          minimizable: false,
          frame: false,
          transparent: true,
          show: false,
          skipTaskbar: true,
          alwaysOnTop: true,
          webPreferences: {
            session: sess
          }
        },
        '/notification',
        false,
        {},
        true,
        {
          _info: notificationInfo
        },
        PRELOAD_JS_NOTIFICATION
      )
      bw.addListener('close', async (event) => {
        event.preventDefault()
        if (!bw) {
          return
        }

        bw.hide()

        const _position = (bw.webContents as any)._position as string
        let _durationId = (bw.webContents as any)._durationId as any

        const view = bw?.getBrowserView()
        if (view) {
          bw?.removeBrowserView(view)
          ;(view as any).destroy()
          _durationId = (view.webContents as any)._durationId as any
        }

        if (_durationId) {
          clearTimeout(_durationId)
        }

        delete (bw.webContents as any)._showOk
        delete (bw.webContents as any)._position

        try {
          notificationInfo.onClose && notificationInfo.onClose()
        } catch (e: any) {
          //nothing
        }

        await _lock.acquire('bw', (done) => {
          if (!bw) {
            return
          }
          try {
            const positionWinList = _nowOpenedNotificationWin[_position]
            if (!positionWinList) {
              return
            }

            const index = positionWinList.indexOf(bw)
            if (index < 0) {
              return
            }

            positionWinList.splice(index, 1)

            const bwBounds = bw.getBounds()
            _positionHeight[_position] -= bwBounds.height
            if (_positionHeight[_position] < 0) {
              _positionHeight[_position] = 0
            }

            if (_position === 'noRest') {
              return
            }

            if (positionWinList.length > index) {
              for (let i = index; i < positionWinList.length; i++) {
                const win = positionWinList[i]
                const winBounds = win.getBounds()
                if (_position.startsWith('top')) {
                  win.setBounds({ ...winBounds, y: winBounds.y - bwBounds.height })
                } else {
                  win.setBounds({ ...winBounds, y: winBounds.y + bwBounds.height })
                }
                //     const win = _nowOpenedNotificationWin[i]
                //     const winBounds = win.getBounds()
                //     win.setBounds({...winBounds, })
              }
            }
          } finally {
            if (_browserWindowPool.length < _maxBwSize) {
              _browserWindowPool.push(bw)
            } else {
              bw.destroy()
            }
            done()
          }
        })
        try {
          await bw.webContents.loadURL('about:blank')
        } catch (e) {
          //nothing
        }
      })
      if (type === 'custom') {
        const view = new BrowserView({
          webPreferences: {
            sandbox: false
          }
        })
        try {
          await view.webContents.loadURL(notificationInfo.url!)
          const bwBounds = bw.getBounds()
          view.setAutoResize({ width: true, height: true })
          view.setBounds({ x: 0, y: 0, width: bwBounds.width, height: bwBounds.height })
          bw.setBrowserView(view)
          if (is.dev) {
            optimizer.watchWindowShortcuts(view as any)
          }
        } catch (e) {
          done(new Error('消息通知远程内容加载失败: ' + JSON.stringify(e)))
          if (view.webContents.isDestroyed()) {
            ;(view.webContents as any).destroy()
          }
          bw.close()
          return
        }
      }
    } else {
      ;(bw.webContents as any)._info = notificationInfo
      bw.webContents.goBack()
    }

    // bw.webContents.openDevTools()

    if (is.dev) {
      optimizer.watchWindowShortcuts(bw)
    }

    done(undefined, bwId)
  })
}
