import React, {
  FC,
  CSSProperties,
  useMemo,
  useState,
  useEffect,
  useCallback,
  KeyboardEvent,
  useRef
} from 'react'
import classnames from 'classnames'
import { Input, InputProps, InputValue } from 'tdesign-react'
import { SearchIcon } from 'tdesign-icons-react'
import Tabs from '@alifd/next/lib/tab'
import '@alifd/next/lib/tab/index.scss'
import './index.scss'
import Avatar from '../Avatar'
import classNames from 'classnames'

export interface SearchResultTabs {
  id: string
  name: string
}

export interface SearchResult<T> {
  id: string
  typeId: 'users' | 'apps' | 'groups'
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
  onEscKeyUp?: () => void
  onSearchResultItemClick?: (result: SearchResult<any>) => void
  onFocus?: () => void
}

export const SearchInput: FC<SearchInputProps & InputProps> = ({
  className,
  style,
  placeholder,
  resultTabs,
  result,
  showResult,
  onEscKeyUp,
  onSearchResultItemClick,
  onFocus,
  ...otherProps
}) => {
  const currentTabKeyRestOk = useRef<boolean>(false)
  const activeSearchResultRef = useRef<SearchResult<any> | undefined>(undefined)
  const [currentTabKey, setCurrentTabKey] = useState<string>()
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [showResultTabContent, setShowResultTabContent] = useState<boolean>(false)

  const searchResultItemClick = useCallback(
    (activeResult?: SearchResult<any>) => {
      activeResult = activeResult || activeSearchResultRef.current
      if (!onSearchResultItemClick || !activeResult) {
        return
      }
      onSearchResultItemClick(activeResult)
    },
    [onSearchResultItemClick]
  )

  const resultTabElements: { [key: string]: React.ReactNode[] } | undefined = useMemo(() => {
    if (!resultTabs || !result) {
      return undefined
    }

    const resultMap: { [key: string]: React.ReactNode[] } = {}
    for (const r of resultTabs) {
      resultMap[r.id] = []
    }

    result.forEach((r) => {
      const active = resultMap[r.typeId].length === currentIndex
      if (active && r.typeId === currentTabKey) {
        activeSearchResultRef.current = r
      }
      resultMap[r.typeId]?.push(
        <div
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          onClick={() => {
            searchResultItemClick(r)
          }}
          className={classNames('search-result-item', {
            active
          })}
          key={r.id}
        >
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
    setCurrentTabKey((key) => {
      if (key && resultMap[key] && resultMap[key].length > 0) {
        return key
      }

      for (const r of resultTabs) {
        if (resultMap[r.id] && resultMap[r.id].length > 0) {
          return r.id
        }
      }

      return key
    })
    return resultMap
  }, [resultTabs, result, currentIndex, currentTabKey])

  const searchResultElements = useMemo(() => {
    if (showResultTabContent) {
      return (
        <Tabs
          disableKeyboard
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          onKeyUp={(event) => {
            searchInputKeyDown('', { e: event as any })
          }}
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          onChange={(key) => {
            setCurrentTabKey(key)
          }}
          activeKey={currentTabKey}
        >
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
  }, [showResultTabContent, resultTabs, resultTabElements, currentTabKey])

  useEffect(() => {
    setCurrentIndex(-1)
  }, [currentTabKey])

  const searchInputKeyDown = useCallback(
    (
      _value: InputValue,
      context: {
        e: KeyboardEvent<HTMLInputElement>
      }
    ) => {
      const key = context.e.key.toLowerCase()
      if (key !== 'arrowdown' && key !== 'arrowup' && key !== 'escape' && key !== 'enter') {
        return
      }

      const event = context.e
      event.preventDefault()
      event.stopPropagation()

      if (key === 'escape') {
        onEscKeyUp && onEscKeyUp()
        return
      }

      if (key === 'enter') {
        searchResultItemClick()
        return
      }

      if (key !== 'arrowdown' && key !== 'arrowup') {
        return
      }
      setCurrentIndex((i) => {
        if (key === 'arrowdown') {
          i += 1
        } else if (key === 'arrowup') {
          i -= 1
        }
        if (i < -1) {
          i = -1
        } else if (resultTabElements && currentTabKey) {
          const tabItems = resultTabElements[currentTabKey]
          if (tabItems && tabItems.length <= i) {
            i = tabItems.length - 1
          }
        }

        if (i === -1) {
          activeSearchResultRef.current = undefined
        }

        return i
      })
    },
    [resultTabs, resultTabElements]
  )

  useEffect(() => {
    if (!showResult || !resultTabElements) {
      currentTabKeyRestOk.current = false
      return
    }

    if (currentTabKeyRestOk.current) {
      return
    }

    currentTabKeyRestOk.current = true

    if (resultTabElements['users']) {
      setCurrentTabKey('users')
    } else if (resultTabElements['groups']) {
      setCurrentTabKey('groups')
    }
  }, [showResult, resultTabElements])

  const preventEvent = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  return (
    <div onClick={preventEvent} className={classnames(className, 'search-input')} style={style}>
      <Input
        size="large"
        className="content"
        prefixIcon={<SearchIcon size="20px" />}
        placeholder={placeholder || '请输入要搜索的联系人'}
        onKeydown={searchInputKeyDown}
        onFocus={onFocus}
        // onKeyup={searchInputKeyUp}
        {...otherProps}
      />

      {showResult && <div className="search-result">{searchResultElements}</div>}
    </div>
  )
}

export default SearchInput
