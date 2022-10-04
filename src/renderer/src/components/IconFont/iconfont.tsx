import { FC } from 'react'
import { IconFont as TIconFont, IconFontProps } from 'tdesign-icons-react'
import '../../iconfonts/iconfont.css'

export const IconFont: FC<IconFontProps> = ({ name, ...otherProps }) => {
  return (
    <TIconFont {...otherProps} name={'iconfont iconfont icon-' + name} loadDefaultIcons={false} />
  )
}

export default IconFont
