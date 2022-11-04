import { ipcRenderer, IpcRendererEvent } from 'electron'
import { id } from '../id'

export interface Menu {
  items(): MenuItem[] | undefined
  popup(): Promise<void>
  click(itemId: string): void
  id(): string
}

export interface MenuItem {
  click?: () => void
  // clickEventName?: string
  role?:
    | 'undo'
    | 'redo'
    | 'cut'
    | 'copy'
    | 'paste'
    | 'pasteAndMatchStyle'
    | 'delete'
    | 'selectAll'
    | 'reload'
    | 'forceReload'
    | 'toggleDevTools'
    | 'resetZoom'
    | 'zoomIn'
    | 'zoomOut'
    | 'toggleSpellChecker'
    | 'togglefullscreen'
    | 'window'
    | 'minimize'
    | 'close'
    | 'help'
    | 'about'
    | 'services'
    | 'hide'
    | 'hideOthers'
    | 'unhide'
    | 'quit'
    | 'showSubstitutions'
    | 'toggleSmartQuotes'
    | 'toggleSmartDashes'
    | 'toggleTextReplacement'
    | 'startSpeaking'
    | 'stopSpeaking'
    | 'zoom'
    | 'front'
    | 'appMenu'
    | 'fileMenu'
    | 'editMenu'
    | 'viewMenu'
    | 'shareMenu'
    | 'recentDocuments'
    | 'toggleTabBar'
    | 'selectNextTab'
    | 'selectPreviousTab'
    | 'mergeAllWindows'
    | 'clearRecentDocuments'
    | 'moveTabToNewWindow'
    | 'windowMenu'
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio'
  label?: string
  sublabel?: string
  toolTip?: string
  icon?: string
  enabled?: boolean
  acceleratorWorksWhenHidden?: boolean
  visible?: boolean
  checked?: boolean
  registerAccelerator?: boolean
  submenu?: MenuItem[]
  before?: string[]
  after?: string[]
  beforeGroupContaining?: string[]
  afterGroupContaining?: string[]
}

let _menuList: Menu[] = []

ipcRenderer.addListener(
  'ipc-contextmenu-click',
  (_event: IpcRendererEvent, menuId: string, itemId: string) => {
    for (const menu of _menuList) {
      if (menu.id() === menuId) {
        menu.click(itemId)
        return
      }
    }
  }
)

function _rangeItemsClick(items: MenuItem[]): void {
  for (const item of items) {
    if (item.click) {
      ;(item as any).id = id.uuid()
    }
    if (item.submenu) {
      _rangeItemsClick(item.submenu)
    }
  }
}

export class MenuImpl implements Menu {
  public constructor(private _items: MenuItem[], private _menuId?: string) {
    if (!this._menuId) {
      this._menuId = id.uuid()
    }

    for (const menu of _menuList) {
      if (menu.id() === this._menuId) {
        throw new Error('菜单ID已存在')
      }
    }

    _rangeItemsClick(this._items)
    this.items = this.items.bind(this)
    this.popup = this.popup.bind(this)
    this.click = this.click.bind(this)
    this.id = this.id.bind(this)
    _menuList.push(this)
  }

  public id(): string {
    return this._menuId!
  }

  public items(): MenuItem[] {
    return this._items
  }

  public async popup(): Promise<void> {
    const res = await ipcRenderer.invoke(
      'ipc-context-menu-popup',
      this._menuId,
      JSON.stringify(this._items)
    )
    if (res.error) {
      throw new Error(res.message)
    }
  }

  public click(itemId: string): void {
    for (const item of this._items) {
      if (itemId === (item as any).id) {
        if (item.click) {
          item.click()
        }
        return
      }
    }
  }
}

export const contextmenu = {
  build(menuItemList: MenuItem[], menuId?: string): Menu {
    return new MenuImpl(menuItemList, menuId)
  },
  clear(menuId: string): void {
    for (let i = 0; i < _menuList.length; i++) {
      const menu = _menuList[i]
      if (menuId === menu.id()) {
        _menuList.splice(i, 1)
        return
      }
    }
  },
  clearAll(): void {
    _menuList = []
  }
}
