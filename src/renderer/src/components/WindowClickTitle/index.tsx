import { FC } from 'react'

export const WindowClickTitle: FC = () => {
  return (
    <div
      // onClick={window.currentWindow.maximize}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 5,
        backgroundColor: 'red',
        zIndex: 99999999
      }}
      className="electron-no-drag"
    ></div>
  )
}
