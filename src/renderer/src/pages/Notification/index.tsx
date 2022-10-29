import { useCallback } from 'react'
import { FC, useEffect, useState } from 'react'
import { Notification as TdNotification } from 'tdesign-react'

export const Notification: FC = () => {
  const [notificationInfo] = useState<NotificationTemplateInfo>(window.notification.getInfo())
  useEffect(() => {
    const intervalId = setInterval(() => {
      const dom = document.querySelector('.inside-notification')
      if (!dom) {
        return
      }
      clearInterval(intervalId)
      window.notification.show(dom.clientHeight)
    }, 50)
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const onCloseBtnClick = useCallback(() => {
    window.currentWindow.close()
  }, [])

  return (
    <TdNotification
      className="inside-notification"
      closeBtn={notificationInfo.closable}
      style={{ width: '100%' }}
      theme="info"
      title={notificationInfo.title}
      content={notificationInfo.body}
      onCloseBtnClick={onCloseBtnClick}
    />
  )
}
