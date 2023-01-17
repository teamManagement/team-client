import SearchInput from '@renderer/components/SearchInput'
import { SearchResult, SearchResultTabs } from '@renderer/components/SearchInput/searchInput'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { InputValue } from 'tdesign-react'
import { DataSourceMeta, useSearchResultList } from '@renderer/pages/Home/hooks'

const searchResultTab: SearchResultTabs[] = [
  { id: 'users', name: '用户' },
  { id: 'groups', name: '群组' },
  { id: 'apps', name: '应用' }
]

export interface SearchProps {
  // users?: UserInfo[]
  // groups?: ChatGroupInfo[]
  // apps?: AppInfo[]
  onSearchResultItemClick?: (result: SearchResult<DataSourceMeta>) => void
}

export const Search: FC<SearchProps> = ({ onSearchResultItemClick }) => {
  const searchResultHaveInputVal = useRef<boolean>(false)
  const [searchResultDataSource, , searchQuery] = useSearchResultList()

  const [searchVal, setSearchVal] = useState<InputValue>('')
  const [showResult, setShowResult] = useState<boolean>(false)

  const hideResult = useCallback(() => {
    searchResultHaveInputVal.current = false
    setShowResult(false)
  }, [])

  const searchInputOnChange = useCallback((val: InputValue) => {
    setSearchVal(val)
    const valStr = val.toString()
    if (!valStr) {
      hideResult()
      return
    }
    searchQuery(valStr)
    setShowResult(true)
    searchResultHaveInputVal.current = true
  }, [])

  const searInputOnEscKeyUp = useCallback(() => {
    setShowResult(false)
  }, [])

  const searchResultOnClick = useCallback((r: SearchResult<any>) => {
    setSearchVal('')
    hideResult()
    onSearchResultItemClick && onSearchResultItemClick(r)
  }, [])

  useEffect(() => {
    const eventFn: () => void = () => {
      setShowResult(false)
    }
    document.addEventListener('click', eventFn)
    return () => {
      document.removeEventListener('click', eventFn)
    }
  }, [])

  const searchInputOnFocus = useCallback(() => {
    if (!searchResultHaveInputVal.current) {
      return
    }
    setShowResult(true)
  }, [])

  return (
    <div className="search">
      <SearchInput
        clearable
        value={searchVal}
        showResult={showResult}
        onChange={searchInputOnChange}
        resultTabs={searchResultTab}
        result={searchResultDataSource}
        style={{ height: 28 }}
        onEscKeyUp={searInputOnEscKeyUp}
        onSearchResultItemClick={searchResultOnClick}
        onFocus={searchInputOnFocus}
      />
    </div>
  )
}
