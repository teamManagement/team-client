import { FC } from 'react'
import './index.scss'

export interface LoadingProps {
  desc?: string
}

export const Loading: FC<LoadingProps> = ({ desc }) => {
  return (
    <div className="loading">
      <div className="loading-container">
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      {desc && <div className="loading-desc">{desc}</div>}
    </div>
  )
}

export default Loading
