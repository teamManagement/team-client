export function getNavEle(): HTMLDivElement | null {
  return document.querySelector<HTMLDivElement>('.home > .content > .nav')
}

export function getContactSidebarEle(): HTMLDivElement | null {
  return document.querySelector<HTMLDivElement>(
    '.home > .content > .content-wrapper > .content-contact > .content-contact-sidebar'
  )
}
