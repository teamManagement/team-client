import { getContactSidebarEle, getNavEle } from '@renderer/dom'
import { useContentWidthSize } from '@renderer/hooks/size'

export function useContactContentWidthSize(): number {
  return useContentWidthSize(() => {
    const navEle = getNavEle()
    const contactSidebarEle = getContactSidebarEle()
    if (!navEle || !contactSidebarEle) {
      return undefined
    }

    return navEle.clientWidth + contactSidebarEle.clientWidth + 36
  })
}
