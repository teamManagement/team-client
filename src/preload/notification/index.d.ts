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

interface Window {
  notification: {
    getInfo(): NotificationTemplateInfo
    show(height?: number): void
  }
}
