import { FC } from 'react'
import './index.scss'

export interface ContentTitleProps {
  title: string
}

export const ContentTitle: FC<ContentTitleProps> = ({ title }) => {
  return (
    <div className="contact-content-title">
      <span>{title}</span>
    </div>
  )
}
