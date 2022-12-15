import { ipcRenderer } from 'electron'
import { uniqueId } from '../../../main/security/random'
import { sendInvokeIpcEventWrapperEventNameAndDataCallBack } from '../tools'

const sendInvokeIpcEventWithNoDataHandler = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'notification',
  undefined
)

interface TemplateObj {
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

interface NotificationBtnInfo {
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

interface NotificationBaseInfo {
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
   * 显示通知失败
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

/**
 * 通知信息
 */
interface NotificationTemplateInfo extends NotificationBaseInfo {
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

interface NotificationCustomInfo extends NotificationBaseInfo {
  /**
   * 自定义内容URL
   */
  url?: string
}

type NotificationShowInfo = Omit<
  NotificationCustomInfo & NotificationTemplateInfo,
  'titleClick' | 'bodyClick' | 'btns' | 'onClose' | 'onShow' | 'onError'
> & {
  id: string
  titleClick: boolean
  bodyClick: boolean
  onClose: boolean
  onShow: boolean
  onError: boolean
  btns?: (Omit<NotificationBtnInfo, 'click' | 'doubleClick'> & {
    click?: boolean
    doubleClick?: boolean
  })[]
}

const eventMap: { [key: string]: NotificationTemplateInfo & NotificationCustomInfo } = {}

const notificationEventName = '__TEAMWORK_NOTIFICATION_EVENT_PUSH__'

ipcRenderer.addListener(
  notificationEventName,
  (
    _event: any,
    eventData: {
      id: string
      event: 'show' | 'error' | 'close' | 'title' | 'body' | 'btn'
      errMsg?: string
      fnName?: 'click' | 'doubleClick'
      btnIndex?: number
    }
  ) => {
    if (!eventData || typeof eventData.id !== 'string' || eventData.id.length === 0) {
      return
    }
    const templateInfo = eventMap[eventData.id]
    if (!templateInfo) {
      return
    }

    let btn: NotificationBtnInfo
    let eventFn: () => void
    switch (eventData.event) {
      case 'show':
        templateInfo.onShow && templateInfo.onShow()
        return
      case 'error':
        templateInfo.onError && templateInfo.onError(eventData.errMsg || '未知的异常')
        return
      case 'close':
        templateInfo.onClose && templateInfo.onClose()
        return
      case 'title':
        templateInfo.titleClick && templateInfo.titleClick()
        return
      case 'body':
        templateInfo.bodyClick && templateInfo.bodyClick()
        return
      case 'btn':
        if (
          typeof eventData.btnIndex !== 'number' ||
          !templateInfo.btns ||
          eventData.btnIndex < 0
        ) {
          return
        }

        btn = templateInfo.btns[eventData.btnIndex]
        if (!btn) {
          return
        }

        eventFn = btn[eventData.fnName as any]
        if (!eventFn) {
          return
        }
        eventFn()
    }
  }
)

function initShowOptions(option: NotificationBaseInfo): NotificationShowInfo {
  const showOptions = { ...option } as any as NotificationShowInfo
  showOptions.onShow = false
  showOptions.onClose = false
  showOptions.onError = false
  showOptions.titleClick = false
  showOptions.bodyClick = false
  showOptions.btns = undefined

  if (typeof option.onClose === 'function') {
    showOptions.onClose = true
  }

  if (typeof option.onShow === 'function') {
    showOptions.onShow = true
  }

  if (typeof option.onError === 'function') {
    showOptions.onError = true
  }

  showOptions.id = uniqueId()

  return showOptions
}

export const notification = {
  showWithTemplate(option: NotificationTemplateInfo): Promise<void> {
    const showOptions = initShowOptions(option)
    if (typeof option.titleClick === 'function') {
      showOptions.titleClick = true
    }

    if (typeof option.bodyClick === 'function') {
      showOptions.bodyClick = true
    }

    if (option.btns) {
      showOptions.btns = option.btns as any
      for (let i = 0; i < option.btns.length; i++) {
        const showBtnInfo = showOptions.btns![i]
        showBtnInfo.click = false
        showBtnInfo.doubleClick = false

        const btn = option.btns[i]
        if (typeof btn.click === 'function') {
          showBtnInfo.click = true
        }

        if (typeof btn.doubleClick === 'function') {
          showBtnInfo.doubleClick = true
        }
      }
    }

    eventMap[showOptions.id] = option

    return sendInvokeIpcEventWithNoDataHandler('showWithTemplate', showOptions)
  },
  showWithCustom(option: NotificationCustomInfo): Promise<void> {
    if (typeof option.url !== 'string' || option.url.length === 0) {
      throw new Error('自定义通知UI地址不能为空')
    }

    if (!option.url.startsWith('http://') || !option.url.startsWith('https://')) {
      throw new Error('自定义通知UI地址目前仅支持http(s)协议')
    }

    return sendInvokeIpcEventWithNoDataHandler('showWithTemplate', initShowOptions(option))
  }
}
