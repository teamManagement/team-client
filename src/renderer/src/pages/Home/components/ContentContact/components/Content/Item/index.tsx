import Avatar from '@renderer/components/Avatar'
import classNames from 'classnames'
import { FC, useMemo, CSSProperties, useCallback } from 'react'
import { ChevronRightIcon } from 'tdesign-icons-react'
import { Divider } from 'tdesign-react'
import { ContactContentItemInfo } from '..'

export interface ContactContentItemProps {
  item: ContactContentItemInfo<any>
  style?: CSSProperties
}

export const ContactContentItem: FC<ContactContentItemProps> = ({ item, style }) => {
  const { iconUrl, title, desc, onClick, onDoubleClick } = item

  const itemClick = useCallback(() => {
    if (!onClick) {
      return
    }
    onClick(item)
  }, [item])

  const itemOnDoubleClick = useCallback(() => {
    if (!onDoubleClick) {
      return
    }
    onDoubleClick(item)
  }, [item])

  const noDesc = useMemo<boolean>(() => {
    return typeof desc !== 'string' || desc.length <= 0
  }, [desc])
  switch (item.type) {
    case 'separation':
      return (
        <Divider align="left" layout="horizontal">
          {title}
        </Divider>
      )
    default:
      return (
        <div
          onClick={itemClick}
          onDoubleClick={itemOnDoubleClick}
          className="content-item"
          style={style}
        >
          <div className="blank"></div>
          <div className="icon flex-align-center">
            <Avatar iconUrl={iconUrl} size="48px" name={title || '未知'} />
          </div>
          <div className="item-desc">
            <div
              className={classNames('desc-wrapper title', {
                noDesc
              })}
            >
              {title}
            </div>
            {!noDesc && (
              <div className="desc-wrapper desc">
                <span>{desc}</span>
              </div>
            )}
          </div>
          <div className="item-navigate" onClick={itemOnDoubleClick}>
            <ChevronRightIcon size="28px" />
          </div>
        </div>
      )
  }
}
