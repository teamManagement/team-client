import { Children, FC, ReactNode, useCallback } from 'react'
import './index.scss'

export interface AppOpenTitleProps {
  startEle?: ReactNode | ReactNode[] | string
  endEle?: ReactNode | ReactNode[] | string
  title?: string
}

export const AppOpenTitle: FC<AppOpenTitleProps> = ({ startEle, endEle, title }) => {
  const convertEle = useCallback((eleList: any) => {
    return Children.map(eleList, (el) => {
      return <div className="operation-icon">{el}</div>
    })
  }, [])
  return (
    <div className="app-open-title">
      <div className="operation-start">
        {convertEle(startEle)}
        {/* <div title="返回列表" className="operation-icon">
          <Button shape="square" variant="text" icon={<RollbackIcon size="22px" />} />
        </div> */}
      </div>
      <div className="operation-title">
        <span>{title}</span>
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
