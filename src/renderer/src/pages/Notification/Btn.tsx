import { TemplateContent, useTemplate } from '@renderer/hooks/templates'
import { FC, useCallback } from 'react'
import { Button } from 'tdesign-react'

export interface BtnProps {
  info: Omit<NotificationBtnInfo, 'title'> & { title: TemplateContent }
}
export const Btn: FC<BtnProps> = ({ info }) => {
  const [title] = useTemplate(info.title)

  const onClick = useCallback(() => {
    info.click && info.click()
  }, [info])

  const onDoubleClick = useCallback(() => {
    info.doubleClick && info.doubleClick()
  }, [info])

  return (
    <Button
      style={{ marginLeft: 8 }}
      theme={info.theme}
      variant={info.variant}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {title}
    </Button>
  )
}
