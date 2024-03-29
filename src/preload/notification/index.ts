import { contextBridge, ipcRenderer } from 'electron'

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

interface NotificationBaseInfo {
  /**
   * 内部类型
   */
  _type: 'template' | 'custom'
  /**
   * 发送者的窗体ID
   */
  _senderId?: number
  /**
   * 监听显示
   */
  onShow?: boolean
  /**
   * 监听关闭
   */
  onClose?: boolean
  /**
   * 位置
   */
  position?:
    | 'topCenter'
    | 'topLeft'
    | 'topRight'
    | 'centerLeft'
    | 'center'
    | 'centerRight'
    | 'bottomLeft'
    | 'bottomCenter'
    | 'bottomRight'
    | { x?: number; y?: number }
}

/**
 * 通知信息
 */
interface NotificationTemplateInfo extends NotificationBaseInfo {
  /**
   * 标题
   */
  title?: string
  /**
   * 内容
   */
  body?: string
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
  //   btns?: NotificationBtnInfo[]
}

const apiMap: { [key: string]: any } = {
  notification: {
    getInfo(): NotificationTemplateInfo {
      return ipcRenderer.sendSync(NotificationEventName.GET_NOTIFICATION)
    },
    show(height?: number): void {
      ipcRenderer.invoke(NotificationEventName.SHOW_CONTENT, height)
    },
    callEvent(
      eventType: 'title' | 'body' | 'btn',
      eventFnName: string,
      btnIndex?: number
    ): Promise<void> {
      return ipcRenderer.invoke(
        NotificationEventName.EVENT_NOTIFICATION,
        eventType,
        eventFnName,
        btnIndex
      )
    }
  }
}

for (const k in apiMap) {
  if (process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld(k, apiMap[k])
    } catch (e) {
      console.error(e)
    }
  } else {
    window[k] = apiMap[k]
  }
}
