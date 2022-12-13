import { FC, useMemo, ReactNode } from 'react'
import { useContactContentWidthSize } from '../hooks'
import './index.scss'
import { ContactContentItem } from './Item'

export interface ContactContentItemInfo<T> {
  id: string
  title: string
  type?: 'default' | 'separation'
  iconUrl?: string
  desc?: string
  meta?: T
  onClick?(item: ContactContentItemInfo<T>): void
  onDoubleClick?(item: ContactContentItemInfo<T>): void
}

export interface ContactContentProps {
  items: ContactContentItemInfo<any>[]
}

export const ContactContent: FC<ContactContentProps> = ({ items }) => {
  const itemWidth = useContactContentWidthSize() + 18
  const itemsEle = useMemo<ReactNode>(() => {
    return items.map((item) => {
      return <ContactContentItem style={{ width: itemWidth }} item={item} key={item.id} />
    })
  }, [items, itemWidth])
  return <div className="contact-wrapper-content">{itemsEle}</div>
}
