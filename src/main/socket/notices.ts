import { WebContents } from 'electron'

export type WebsocketNotificationHandler = (...data: any) => void
export interface WebsocketMessageNotification {
  id: string
  handler: WebsocketNotificationHandler
  sender?: WebContents
}

type NotificationName = 'userOnlineStatus'

type NotificationMap = {
  [key in NotificationName]: WebsocketMessageNotification[]
}

const _notificationMap: NotificationMap = {
  userOnlineStatus: []
}

export function registerWsNotification(
  name: NotificationName,
  notificationInfo: WebsocketMessageNotification
): void {
  if (!notificationInfo.id || notificationInfo.id.length <= 0) {
    return
  }

  const _notificationInfoList = _notificationMap[name]
  if (!_notificationInfoList) {
    return
  }

  for (let i = 0; i < _notificationInfoList.length; i++) {
    const _info = _notificationInfoList[i]
    if (_info.id === notificationInfo.id) {
      _notificationInfoList[i] = notificationInfo
      return
    }
  }
  _notificationInfoList.push(notificationInfo)
}

export function unRegisterNotification(name: NotificationName, id: string): void {
  if (!name || !id) {
    return
  }

  const _notificationList = _notificationMap[name]
  if (!_notificationList) {
    return
  }

  for (let i = 0; i < _notificationList.length; i++) {
    if (_notificationList[i].id === id) {
      _notificationList.splice(i, 1)
      return
    }
  }
}

export function unRegisterBySender(sender: WebContents): void {
  for (const key in _notificationMap) {
    const _notificationList = _notificationMap[key as NotificationName]
    for (let i = _notificationList.length - 1; i >= 0; i--) {
      if (_notificationList[i].sender === sender) {
        _notificationList.splice(i, 1)
      }
    }
  }
}

export function clearAllWsNotification(): void {
  _notificationMap.userOnlineStatus = []
}

export function sendNotification(name: NotificationName, ...data: any): void {
  const _notificationList = _notificationMap[name]
  if (!_notificationList) {
    return
  }

  for (let i = 0; i < _notificationList.length; i++) {
    _notificationList[i].handler(...data)
  }
}
