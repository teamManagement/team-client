import { FC, useCallback, useEffect, useState } from 'react'
import { ContactContent, ContactContentItemInfo } from '../Content'
import { ContentBreadcrumb, ContentBreadcrumbItem } from '../ContentBreadcrumb'
import { ContentTitle } from '../ContentTitle'
import { api } from '@teamworktoolbox/inside-sdk'
import { OrgInfo, UserInfo } from '@teamworktoolbox/sdk'
import { MessagePlugin } from 'tdesign-react'
import { useNavigate } from 'react-router-dom'

export const OrgContact: FC = () => {
  const navigate = useNavigate()
  // const [loadingDesc, setLoadingDesc] = useState<string>('')
  const [contentItems, setContentItems] = useState<ContactContentItemInfo<any>[]>([])
  const [contentBreadcrumbItems, setContentBreadcrumbItems] = useState<
    ContentBreadcrumbItem<any>[]
  >([])

  const queryOrgItems = useCallback(async (orgId: string) => {
    const orgList = await api.proxyHttpCoreServer<OrgInfo[]>('/org/list/' + orgId)
    const items: ContactContentItemInfo<OrgInfo>[] = []
    if (orgList && orgList.length > 0) {
      for (const org of orgList) {
        items.push({
          id: org.id,
          title: org.name,
          iconUrl: org.icon,
          desc: org.desc,
          meta: org,
          onClick(item) {
            queryItems(item.id)
          }
        })
      }
    }
    return items
  }, [])

  const queryUserItems = useCallback(async (orgId: string) => {
    const userList = await api.proxyHttpCoreServer<UserInfo[]>('/org/inside/user/list/' + orgId)
    const items: ContactContentItemInfo<UserInfo>[] = []
    if (userList && userList.length > 0) {
      for (const user of userList) {
        items.push({
          id: user.id,
          title: user.name,
          iconUrl: user.icon,
          meta: user,
          onDoubleClick(item) {
            navigate(`/home/comments?_u=${item.id}`)
          }
        })
      }
    }
    return items
  }, [])

  const rootBreadcrumbClick = useCallback(() => {
    queryItems('0')
  }, [])

  const queryBreadcrumbItems = useCallback(async (currentOrgId: string) => {
    if (currentOrgId === '0') {
      setContentBreadcrumbItems([])
      return
    }

    const currentOrgInfo = await api.proxyHttpCoreServer<OrgInfo>(
      '/org/fill/parent/' + currentOrgId
    )

    const targetItems: ContentBreadcrumbItem<OrgInfo>[] = []
    recursiveOrgParentToBreadcrumbItem(targetItems, currentOrgInfo)

    setContentBreadcrumbItems(targetItems)
  }, [])

  const recursiveOrgParentToBreadcrumbItem = useCallback(
    (targetList: ContentBreadcrumbItem<OrgInfo>[], orgInfo?: OrgInfo) => {
      if (!orgInfo) {
        return
      }

      targetList.unshift({
        id: orgInfo.id,
        title: orgInfo.name,
        meta: orgInfo,
        onClick(item) {
          queryItems(item.id)
        }
      })

      recursiveOrgParentToBreadcrumbItem(targetList, orgInfo.parent)
    },
    []
  )

  const queryItems = useCallback(async (currentOrgId: string) => {
    try {
      // setLoadingDesc('正在查询机构列表...')
      const orgItems = await queryOrgItems(currentOrgId)
      // setLoadingDesc('正在查询机构内人员信息列表...')
      const userItems = await queryUserItems(currentOrgId)

      // setLoadingDesc('组织导航信息...')
      await queryBreadcrumbItems(currentOrgId)

      setContentItems([
        { id: 'divider-org', type: 'separation', title: `机构( ${orgItems.length}个 )` },
        ...orgItems,
        { id: 'divider-user', type: 'separation', title: `人员( ${userItems.length}个 )` },
        ...userItems
      ])
    } catch (e) {
      MessagePlugin.error('查询机构列表失败: ' + (e as any).message)
    } finally {
      // setLoadingDesc('')
    }
  }, [])

  useEffect(() => {
    queryItems('0')
  }, [queryItems])

  return (
    <div className="contact-wrapper">
      <ContentTitle title="组织架构" />
      {contentBreadcrumbItems && contentBreadcrumbItems.length > 0 && (
        <ContentBreadcrumb
          showRoot
          rootClick={rootBreadcrumbClick}
          items={contentBreadcrumbItems}
        />
      )}
      <ContactContent items={contentItems} />
      {/* <Loading
        loading={!!loadingDesc}
        text={loadingDesc}
        showOverlay
        fullscreen
        preventScrollThrough
      /> */}
    </div>
  )
}
