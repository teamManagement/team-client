import { AppInfo, UserInfo } from '@byzk/teamwork-sdk'
import { ChatGroupInfo } from '@byzk/teamwork-inside-sdk'
import SearchInput from '@renderer/components/SearchInput'
import { SearchResult, SearchResultTabs } from '@renderer/components/SearchInput/searchInput'
import { FC, useCallback, useEffect, useState } from 'react'
import { InputValue } from 'tdesign-react'
import { pinyin } from 'pinyin-pro'

const searchResultTab: SearchResultTabs[] = [
  { id: 'users', name: '用户' },
  { id: 'groups', name: '群组' },
  { id: 'apps', name: '应用' }
]

export interface SearchProps {
  users?: UserInfo[]
  groups?: ChatGroupInfo[]
  apps?: AppInfo[]
}

export const Search: FC<SearchProps> = ({ users, apps, groups }) => {
  const [dataSource, setDataSource] = useState<SearchResult<{ pinyin: string }>[]>([])
  const [searchResult, setSearchResult] = useState<SearchResult<{ pinyin: string }>[]>([])
  const [showResult, setShowResult] = useState<boolean>(false)

  useEffect(() => {
    const dataSource: SearchResult<{ pinyin: string }>[] = []
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
            pinyin: pinyin(u.name, { toneType: 'none', type: 'string' }).replaceAll(' ', '')
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
            pinyin: pinyin(app.name, { toneType: 'none', type: 'string' }).replaceAll(' ', '')
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
            pinyin: pinyin(group.name, { toneType: 'none', type: 'string' }).replaceAll(' ', '')
          }
        })
      })
    }

    setDataSource(dataSource)
  }, [users, apps, groups])

  const searchInputOnChange = useCallback(
    (val: InputValue) => {
      const valStr = val.toString()
      if (!valStr) {
        setShowResult(false)
        return
      }
      setSearchResult(
        dataSource.filter((v) => {
          return v.name.includes(valStr) || (v.metaData && v.metaData.pinyin.includes(valStr))
        })
      )
      setShowResult(true)
    },
    [dataSource]
  )
  return (
    <div className="search">
      <SearchInput
        clearable
        showResult={showResult}
        onChange={searchInputOnChange}
        resultTabs={searchResultTab}
        result={searchResult}
        style={{ height: 28 }}
      />
    </div>
  )
}
