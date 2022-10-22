import classNames from 'classnames'
import { Children, FC, ReactNode, useCallback } from 'react'
import './index.scss'

export interface AppOpenTitleProps {
  startEle?: ReactNode | ReactNode[] | string
  endEle?: ReactNode | ReactNode[] | string
  title?: string
  drag?: boolean
  iconUrl?: string
  disabled?: boolean
}

export const AppOpenTitle: FC<AppOpenTitleProps> = ({
  startEle,
  endEle,
  title,
  drag,
  iconUrl,
  disabled
}) => {
  const convertEle = useCallback((eleList: any) => {
    return Children.map(eleList, (el) => {
      return <div className="operation-icon electron-no-drag">{el}</div>
    })
  }, [])
  return (
    <div
      title={title}
      className={classNames('app-open-title', { 'electron-drag': drag, disabled })}
    >
      <div className="operation-start">
        {convertEle(startEle)}
        {/* <div title="返回列表" className="operation-icon">
          <Button shape="square" variant="text" icon={<RollbackIcon size="22px" />} />
        </div> */}
      </div>
      <div className="operation-title">
        {iconUrl && (
          <div className="icon">
            <img src={iconUrl} />
          </div>
        )}
        <div className="desc">
          <span>{title}</span>
        </div>
      </div>
      <div className="operation-end">
        {convertEle(endEle)}
        {/* <div title="外部打开" className="operation-icon">
          <Button shape="square" variant="text" icon={<JumpIcon size="22px" />} />
        </div>
        <div title="彻底关闭" className="operation-icon">
          <Button
            shape="square"
            variant="text"
            theme="danger"
            icon={<PoweroffIcon size="22px" />}
          />
        </div> */}
      </div>
    </div>
  )
}

export default AppOpenTitle
