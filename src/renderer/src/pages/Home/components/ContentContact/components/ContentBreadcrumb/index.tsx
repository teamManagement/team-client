import { FC, useMemo, ReactNode, MouseEvent, useCallback } from 'react'
import Breadcrumb from '@alifd/next/lib/breadcrumb'
import '@alifd/next/lib/breadcrumb/index.scss'
import './index.scss'
import { useContactContentWidthSize } from '../hooks'
import { RootListIcon } from 'tdesign-icons-react'

export interface ContentBreadcrumbItem<T> {
  id: string
  title: string
  meta?: T
  onClick?(item: ContentBreadcrumbItem<T>): void
}

export interface ContentBreadcrumbProps {
  items: ContentBreadcrumbItem<any>[]
  showRoot?: boolean
  rootClick?(): void
}

export const ContentBreadcrumb: FC<ContentBreadcrumbProps> = ({ items, showRoot, rootClick }) => {
  const breadcrumbWidth = useContactContentWidthSize()

  const rootClickWrapper = useCallback((event: MouseEvent) => {
    event.preventDefault()
    rootClick && rootClick()
  }, [])

  const itemEle = useMemo(() => {
    const eleList: ReactNode[] = []
    if (!items || items.length <= 0) {
      return eleList
    }

    let start = true
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i]
      const id = item.id
      const onClick: (event: MouseEvent) => void = (event) => {
        event.preventDefault()
        item.onClick && item.onClick(item)
      }
      if (start) {
        eleList.unshift(
          <Breadcrumb.Item key={id} style={{ cursor: 'default' }}>
            {item.title}
          </Breadcrumb.Item>
        )
        start = false
      } else {
        eleList.unshift(
          <Breadcrumb.Item onClick={onClick} link="#" key={id}>
            {item.title}
          </Breadcrumb.Item>
        )
      }
    }

    if (showRoot) {
      eleList.unshift(
        <Breadcrumb.Item onClick={rootClickWrapper} link="#" key="root">
          <RootListIcon size="18px" />
        </Breadcrumb.Item>
      )
    }

    return eleList
  }, [items])
  return (
    <div className="content-breadcrumb">
      <div className="container" style={{ width: breadcrumbWidth }}>
        <Breadcrumb key={'content-breadcrumb-' + breadcrumbWidth} maxNode="auto" showHiddenItems>
          {itemEle}
        </Breadcrumb>
      </div>
    </div>
  )
}
