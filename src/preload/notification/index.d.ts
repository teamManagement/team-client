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

interface TemplateRenderDataBase {
  updateData(data: any): void
  updateTml(tmlObj: TemplateObj): void
  click(): void
  doubleClick(): void
  close(): void
  data: any
}

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
  click(): void
  /**
   * 双击
   */
  doubleClick(): void
}

/**
 * 通知信息
 */
interface NotificationTemplateInfo extends NotificationBaseInfo {
  /**
   * 标题
   */
  title?: string | TemplateObj
  titleClick?: boolean
  /**
   * 内容
   */
  body?: string | TemplateObj
  bodyClick?: boolean
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
  /**
   * 大小
   */
  size?: { width?: number; height?: number }
}

interface Window {
  notification: {
    getInfo(): NotificationTemplateInfo
    show(height?: number): void
    callEvent(
      eventType: 'title' | 'body' | 'btn',
      eventFnName: 'click' | 'doubleClick',
      btnIndex?: number
    ): Promise<void>
  }
}
