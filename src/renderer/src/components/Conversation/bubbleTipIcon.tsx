import { FC } from 'react'

export interface BubbleTipIconProps {
  width?: number
  height?: number
  color?: string
}

export const BubbleTipIcon: FC<BubbleTipIconProps> = ({ width = 29, height = 16, color }) => {
  return (
    <>
      <svg
        width={width}
        height={height}
        color={color}
        viewBox="0 0 29 16"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.48799 1.14592C8.16527 2.53004 6.72888 6.53762 0.510644 10.9194C0.190634 11.145 0.0337882 11.5382 0.110928 11.9222C0.188085 12.3061 0.484537 12.6083 0.866706 12.6929C0.901367 12.7005 1.73407 12.8823 3.2305 13.0133C7.49745 13.3866 16.2914 13.3021 27.4453 8.58744C28.2641 8.70295 4.37803 -1.82241 8.48799 1.14592Z"
          fill={color}
        />
      </svg>
    </>
  )
}
