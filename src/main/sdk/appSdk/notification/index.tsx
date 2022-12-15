import { IpcMainInvokeEvent } from 'electron'
import { SdkHandlerParam } from '../..'
import {
  NotificationBaseInfo,
  NotificationBtnInfo,
  NotificationCustomInfo,
  NotificationTemplateInfo,
  showNotification
} from '../../../notification'
import { AppInfo } from '../../insideSdk/applications'

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

const notificationEventName = '__TEAMWORK_NOTIFICATION_EVENT_PUSH__'

function initTemplateBaseInfo(
  event: IpcMainInvokeEvent,
  option: NotificationShowInfo
): NotificationBaseInfo {
  const templateBaseInfo = { ...option } as any as NotificationTemplateInfo
  templateBaseInfo.onShow = undefined
  templateBaseInfo.onClose = undefined
  templateBaseInfo.onError = undefined
  if (typeof option.onClose === 'boolean' && option.onClose) {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    templateBaseInfo.onClose = () => {
      event.sender.send(notificationEventName, {
        id: option.id,
        event: 'close'
      })
    }
  }

  if (typeof option.onShow === 'boolean' && option.onShow) {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    templateBaseInfo.onShow = () => {
      event.sender.send(notificationEventName, {
        id: option.id,
        event: 'show'
      })
    }
  }

  if (typeof option.onError === 'boolean' && option.onError) {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    templateBaseInfo.onError = (errMsg) => {
      event.sender.send(notificationEventName, {
        id: option.id,
        event: 'error',
        errMsg
      })
    }
  }

  return templateBaseInfo
}

const notificationMap = {
  async showWithTemplate(event: IpcMainInvokeEvent, options: NotificationShowInfo): Promise<void> {
    const templateInfo = initTemplateBaseInfo(event, options) as NotificationTemplateInfo
    templateInfo.titleClick = undefined
    templateInfo.bodyClick = undefined
    templateInfo.btns = undefined

    if (typeof options.titleClick === 'boolean' && options.titleClick) {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      templateInfo.titleClick = () => {
        event.sender.send(notificationEventName, {
          id: options.id,
          event: 'title'
        })
      }
    }

    if (typeof options.bodyClick === 'boolean' && options.bodyClick) {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      templateInfo.bodyClick = () => {
        event.sender.send(notificationEventName, {
          id: options.id,
          event: 'body'
        })
      }
    }

    if (options.btns) {
      templateInfo.btns = []
      for (let i = 0; i < options.btns.length; i++) {
        const btn = options.btns[i]
        const btnOptions = { ...btn } as NotificationBtnInfo
        btnOptions.click = undefined
        btnOptions.doubleClick = undefined

        if (typeof btn.click === 'boolean' && btn.click) {
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          btnOptions.click = () => {
            event.sender.send(notificationEventName, {
              id: options.id,
              event: 'btn',
              fnName: 'click',
              btnIndex: i
            })
          }
        }

        if (typeof btn.doubleClick === 'boolean' && btn.doubleClick) {
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          btnOptions.click = () => {
            event.sender.send(notificationEventName, {
              id: options.id,
              event: 'btn',
              fnName: 'doubleClick',
              btnIndex: i
            })
          }
        }
      }
    }

    await showNotification('template', templateInfo)
  }
}

export function _notificationHandler(param: SdkHandlerParam<IpcMainInvokeEvent, AppInfo>): any {
  const handler = notificationMap[param.eventName]
  if (!handler) {
    throw new Error('未知的notification指令')
  }
  return handler(param.event, ...param.otherData)
}
