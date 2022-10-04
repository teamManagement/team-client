import { FC, CSSProperties } from 'react'
import classnames from 'classnames'
import { Input, InputProps } from 'tdesign-react'
import { SearchIcon } from 'tdesign-icons-react'
import './index.scss'

export interface SearchInputProps {
  className?: string
  style?: CSSProperties
}

export const SearchInput: FC<SearchInputProps & InputProps> = ({
  className,
  style,
  placeholder,
  ...otherProps
}) => {
  return (
    <div className={classnames(className, 'search-input')} style={style}>
      <Input
        size="large"
        className="content"
        prefixIcon={<SearchIcon size="20px" />}
        placeholder={placeholder || '请输入要搜索的内容...'}
        {...otherProps}
      />
    </div>
  )
}

export default SearchInput
