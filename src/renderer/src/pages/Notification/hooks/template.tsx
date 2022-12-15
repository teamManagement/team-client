import { useTemplate } from '@renderer/hooks/templates'
import { ReactNode, useMemo } from 'react'
import { Link } from 'tdesign-react'

export function useTemplateTitle(tml: NotificationTemplateInfo): ReactNode {
  const [tmlStr] = useTemplate({
    type: typeof (tml.title || '') === 'string' ? 'string' : 'template',
    val: tml.title || '',
    click() {
      window.notification.callEvent('title', 'click')
    }
  })

  return useMemo(() => {
    if (typeof tml.titleClick === 'boolean' && tml.titleClick) {
      return (
        <Link
          hover="color"
          theme="default"
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            window.notification.callEvent('title', 'click')
          }}
        >
          {tmlStr}
        </Link>
      )
    }
    return tmlStr
  }, [tmlStr])
}

export function useTemplateBody(tml: NotificationTemplateInfo): ReactNode {
  const [tmlStr] = useTemplate({
    type: typeof (tml.body || '') === 'string' ? 'string' : 'template',
    val: tml.body || '',
    click() {
      window.notification.callEvent('title', 'click')
    }
  })

  return useMemo(() => {
    if (typeof tml.bodyClick === 'boolean' && tml.bodyClick) {
      return (
        <Link
          hover="color"
          theme="default"
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            window.notification.callEvent('body', 'click')
          }}
        >
          {tmlStr}
        </Link>
      )
    }
    return tmlStr
  }, [tmlStr])
}
