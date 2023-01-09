import { api, ChatGroupInfo, remoteCache } from '@byzk/teamwork-inside-sdk'
import { AppInfo, UserInfo } from '@byzk/teamwork-sdk'
import { SearchResult } from '@renderer/components/SearchInput/searchInput'
import { pinyin } from 'pinyin-pro'
import { useCallback, useState } from 'react'

export interface DataSourceMeta {
  pinyin: string
  pinyinFirst: string
  type: 'users' | 'groups' | 'apps'
  sourceName?: string
  sourceData: UserInfo | AppInfo | ChatGroupInfo
}

function searchResultFilter<T extends { name: string; username?: string }>(
  rawDataSource: T[],
  keywords: string
): { raw: T; pinyinComplete: string; pinyinFirst: string }[] {
  if (!rawDataSource || rawDataSource.length === 0) {
    return []
  }

  return rawDataSource
    .map((raw) => {
      const pinyinComplete = pinyin(raw.name, { toneType: 'none', type: 'string' }).replaceAll(
        ' ',
        ''
      )
      const pinyinFirst = pinyin(raw.name, {
        toneType: 'none',
        type: 'string',
        pattern: 'first'
      }).replaceAll(' ', '')
      return {
        pinyinFirst,
        pinyinComplete,
        raw
      }
    })
    .filter((r) => {
      return (
        r.raw.name.includes(keywords) ||
        r.pinyinComplete.includes(keywords) ||
        r.pinyinFirst.includes(keywords) ||
        (r.raw.username && r.raw.username.includes(keywords))
      )
    })
}

export function useSearchResultList(): [
  SearchResult<DataSourceMeta>[],
  boolean,
  (keywords: string) => void
] {
  const [loading, setLoading] = useState<boolean>(false)
  const [dataSource, setDataSource] = useState<SearchResult<DataSourceMeta>[]>([])

  const queryDataSource = useCallback(async (keywords: string) => {
    try {
      setLoading(true)

      const dataSource: SearchResult<DataSourceMeta>[] = []

      const appList =
        (await api.proxyHttpLocalServer<AppInfo[]>('services/resources/app/list', {
          timeout: -1
        })) || []

      searchResultFilter(appList, keywords).forEach((r) => {
        const app = r.raw
        dataSource.push({
          id: app.id,
          icon: app.icon,
          typeId: 'apps',
          name: app.name,
          desc: app.desc,
          metaData: {
            pinyin: r.pinyinComplete,
            pinyinFirst: r.pinyinFirst,
            type: 'apps',
            sourceData: app
          }
        })
      })

      const userList = await remoteCache.userList()
      searchResultFilter(userList, keywords).forEach((r) => {
        const user = r.raw
        let desc = ''
        if (user.orgList) {
          for (const o of user.orgList) {
            desc += o.org.name + ','
          }
        }

        if (desc.length > 0) {
          desc = desc.substring(0, desc.length - 1)
          desc = '部门: ' + desc
        }

        dataSource.push({
          id: user.id,
          name: `${user.name}( ${user.username} )`,
          typeId: 'users',
          icon: user.icon,
          iconName: user.name,
          desc,
          metaData: {
            pinyin: r.pinyinComplete,
            pinyinFirst: r.pinyinFirst,
            sourceData: user,
            type: 'users',
            sourceName: useCallback.name
          }
        })
      })

      setDataSource(dataSource)
    } catch (e) {
      // nothing
    } finally {
      setLoading(false)
    }
  }, [])

  return [dataSource, loading, queryDataSource]
}
