import { useCallback, useMemo } from 'react'
import { FC, useEffect, useState } from 'react'
import { Notification as TdNotification } from 'tdesign-react'
import { currentWindow } from '@byzk/teamwork-inside-sdk'
import { TemplateContent } from '@renderer/hooks/templates'
import { Btn } from './Btn'
import { useTemplateBody, useTemplateTitle } from './hooks/template'

export const Notification: FC = () => {
  const [notificationInfo] = useState<NotificationTemplateInfo>(window.notification.getInfo())
  const title = useTemplateTitle(notificationInfo)
  const body = useTemplateBody(notificationInfo)

  const height = useMemo<number>(() => {
    return (notificationInfo.size && notificationInfo.size.height) || 173
  }, [])

  useEffect(() => {
    window.notification.show(height)
  }, [height])

  const onCloseBtnClick = useCallback(() => {
    currentWindow.close()
  }, [])

  const footerBtns = useMemo(() => {
    if (!notificationInfo.btns) {
      return undefined
    }

    return notificationInfo.btns.map((btn, i) => {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      btn.click = () => {
        window.notification.callEvent('btn', 'click', i)
      }
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      btn.doubleClick = () => {
        window.notification.callEvent('btn', 'doubleClick', i)
      }

      const btnTitleTmlInfo = {
        click: btn.click,
        doubleClick: btn.click,
        close: onCloseBtnClick,
        val: btn.title,
        type: 'template'
      } as TemplateContent

      if (typeof btn.title === 'string') {
        btnTitleTmlInfo.type = 'string'
      }

      return <Btn key={i} info={{ ...btn, title: btnTitleTmlInfo }} />
    })
  }, [notificationInfo.btns])

  return (
    <TdNotification
      className="inside-notification"
      closeBtn={notificationInfo.closable}
      style={{ width: '100%', height }}
      theme={notificationInfo.theme || 'info'}
      title={title}
      content={body}
      onCloseBtnClick={onCloseBtnClick}
      footer={footerBtns}
    />
  )
}
