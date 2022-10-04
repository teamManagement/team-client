import { FC, ImgHTMLAttributes } from 'react'

export const ImgBase: FC<ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  return (
    <img
      style={{
        width: '23px',
        height: '23px'
      }}
      {...props}
    />
  )
}
