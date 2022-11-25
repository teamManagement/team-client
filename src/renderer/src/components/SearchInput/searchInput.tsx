import React, { FC, CSSProperties, useMemo, useState } from 'react'
import classnames from 'classnames'
import { Input, InputProps } from 'tdesign-react'
import { SearchIcon } from 'tdesign-icons-react'
import Tabs from '@alifd/next/lib/tab'
import '@alifd/next/lib/tab/index.scss'
import './index.scss'
import Avatar from '../Avatar'

export interface SearchResultTabs {
  id: string
  name: string
}

export interface SearchResult<T> {
  id: string
  typeId: string
  iconName?: string
  icon?: string
  name: string
  desc?: string
  metaData?: T
}

export interface SearchInputProps {
  className?: string
  style?: CSSProperties
  resultTabs?: SearchResultTabs[]
  result?: SearchResult<any>[]
  showResult?: boolean
}

export const SearchInput: FC<SearchInputProps & InputProps> = ({
  className,
  style,
  placeholder,
  resultTabs,
  result,
  showResult,
  ...otherProps
}) => {
  const [showResultTabContent, setShowResultTabContent] = useState<boolean>(false)
  const resultTabElements: { [key: string]: React.ReactNode[] } | undefined = useMemo(() => {
    if (!resultTabs || !result) {
      return undefined
    }

    const resultMap: { [key: string]: React.ReactNode[] } = {}
    for (const r of resultTabs) {
      resultMap[r.id] = []
    }

    result.forEach((r) => {
      resultMap[r.typeId]?.push(
        <div className="search-result-item" key={r.id}>
          <div className="icon">
            <Avatar size="39px" name={r.iconName || r.name} iconUrl={r.icon} />
          </div>
          <div className="desc ">
            <div className="name">{r.name}</div>
            <div className="comments">
              <span>{r.desc}</span>
            </div>
          </div>
        </div>
      )
    })

    let showResultTab = false
    for (const k in resultMap) {
      if (resultMap[k].length > 0) {
        showResultTab = true
        break
      }
    }
    setShowResultTabContent(showResultTab)
    return resultMap
  }, [resultTabs, result])

  const searchResultElements = useMemo(() => {
    if (showResultTabContent) {
      return (
        <Tabs>
          {(resultTabs || []).map((r) => {
            const result = (resultTabElements || {})[r.id]
            if (!result || result.length === 0) {
              return undefined
            }

            return (
              <Tabs.Item key={r.id} title={`${r.name}( ${result.length} )`}>
                {result}
              </Tabs.Item>
            )
          })}
        </Tabs>
      )
    }

    return <div className="empty-result">暂无结果</div>
  }, [showResultTabContent, resultTabs, resultTabElements])

  return (
    <div className={classnames(className, 'search-input')} style={style}>
      <Input
        size="large"
        className="content"
        prefixIcon={<SearchIcon size="20px" />}
        placeholder={placeholder || '请输入要搜索的联系人'}
        {...otherProps}
      />

      {showResult && <div className="search-result">{searchResultElements}</div>}
    </div>
  )
}

export default SearchInput
