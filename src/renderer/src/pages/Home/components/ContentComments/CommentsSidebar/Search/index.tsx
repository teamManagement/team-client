import { AppInfo, UserInfo } from '@byzk/teamwork-sdk'
import { ChatGroupInfo } from '@byzk/teamwork-inside-sdk'
import SearchInput from '@renderer/components/SearchInput'
import { SearchResult, SearchResultTabs } from '@renderer/components/SearchInput/searchInput'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { InputValue } from 'tdesign-react'
import { pinyin } from 'pinyin-pro'
import { useSearchResultList } from '@renderer/pages/Home/hooks'

const searchResultTab: SearchResultTabs[] = [
  { id: 'users', name: '用户' },
  { id: 'groups', name: '群组' },
  { id: 'apps', name: '应用' }
]

export interface DataSourceMeta {
  pinyin: string
  type: 'users' | 'groups' | 'apps'
  sourceName?: string
  sourceData: UserInfo | AppInfo | ChatGroupInfo
}

export interface SearchProps {
  users?: UserInfo[]
  groups?: ChatGroupInfo[]
  apps?: AppInfo[]
  onSearchResultItemClick?: (result: SearchResult<DataSourceMeta>) => void
}

export const Search: FC<SearchProps> = ({ users, apps, groups, onSearchResultItemClick }) => {
  const searchResultHaveInputVal = useRef<boolean>(false)
  const [searchResultDataSource, , searchQuery] = useSearchResultList()

  const [searchVal, setSearchVal] = useState<InputValue>('')
  const [dataSource, setDataSource] = useState<SearchResult<DataSourceMeta>[]>([])
  const [showResult, setShowResult] = useState<boolean>(false)

  useEffect(() => {
    const dataSource: SearchResult<DataSourceMeta>[] = []
    if (users && users.length > 0) {
      users.forEach((u) => {
        let desc = ''
        if (u.orgList) {
          for (const o of u.orgList) {
            desc += o.org.name + ','
          }
        }

        if (desc.length > 0) {
          desc = desc.substring(0, desc.length - 1)
          desc = '部门: ' + desc
        }

        dataSource.push({
          id: u.id,
          name: `${u.name}( ${u.username} )`,
          typeId: 'users',
          icon: u.icon,
          iconName: u.name,
          desc,
          metaData: {
            pinyin: pinyin(u.name, { toneType: 'none', type: 'string' }).replaceAll(' ', ''),
            type: 'users',
            sourceName: u.name,
            sourceData: u
          }
        })
      })
    }

    if (apps && apps.length > 0) {
      apps.forEach((app) => {
        dataSource.push({
          id: app.id,
          icon: app.icon,
          typeId: 'apps',
          name: app.name,
          desc: app.desc,
          metaData: {
            pinyin: pinyin(app.name, { toneType: 'none', type: 'string' }).replaceAll(' ', ''),
            type: 'apps',
            sourceData: app
          }
        })
      })
    }

    if (groups && groups.length > 0) {
      groups.forEach((group) => {
        dataSource.push({
          id: group.id,
          icon: group.icon,
          typeId: 'groups',
          name: group.name,
          desc: group.desc,
          metaData: {
            pinyin: pinyin(group.name, { toneType: 'none', type: 'string' }).replaceAll(' ', ''),
            type: 'groups',
            sourceData: group
          }
        })
      })
    }

    setDataSource(dataSource)
  }, [users, apps, groups])

  const searchInputOnChange = useCallback(
    (val: InputValue) => {
      setSearchVal(val)
      const valStr = val.toString()
      if (!valStr) {
        searchResultHaveInputVal.current = false
        setShowResult(false)
        return
      }
      searchQuery(valStr)
      setShowResult(true)
      searchResultHaveInputVal.current = true
    },
    [dataSource]
  )

  const searInputOnEscKeyUp = useCallback(() => {
    setShowResult(false)
  }, [])

  const searchResultOnClick = useCallback((r: SearchResult<any>) => {
    setSearchVal('')
    setShowResult(false)
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
