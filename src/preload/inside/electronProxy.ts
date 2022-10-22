import { ipcRenderer } from 'electron'

const contextMenuMap: { [key: string]: ContextMenu } = {}

const globalMenuName = 'global'

enum ContextMenuEventName {
  CREATE_CONTEXT_MENU = 'ipc-context-menu-create',
  APPEND_MENU_ITEM = 'ipc-context-menu-item-create',
  MENU_POPUP = 'ipc-context-menu-popup',
  MENU_ITEM_CLICK = 'ipc-context-menu-item-click',
  MENU_ITEM_CLEAR = 'ipc-context-menu-item-clear'
}

interface MenuItemOptions {
  clickEventName?: string
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
  submenu?: MenuItemOptions[]
  id?: string
  before?: string[]
  after?: string[]
  beforeGroupContaining?: string[]
  afterGroupContaining?: string[]
}

export class ContextMenu {
  public static get(): ContextMenu {
    return ContextMenu.getById(globalMenuName)
  }

  public static getById(menuId: string): ContextMenu {
    if (!contextMenuMap[menuId]) {
      contextMenuMap[menuId] = new ContextMenu(menuId)
    }

    return contextMenuMap[menuId]
  }

  private _createStatus: 'ok' | 'error' | 'waiting' = 'waiting'
  private _errMsg?: string = undefined
  private _itemClickMap: { [key: string]: () => void | any } = {}

  private constructor(private _menuId: string) {
    this._apiReturnHandle = this._apiReturnHandle.bind(this)
    this._handlerStatus = this._handlerStatus.bind(this)
    this.appendMenuItem = this.appendMenuItem.bind(this)
    this.registerItemClick = this.registerItemClick.bind(this)
    this.clearItems = this.clearItems.bind(this)
    this.popup = this.popup.bind(this)

    ipcRenderer.addListener(ContextMenuEventName.MENU_ITEM_CLICK, (_event, id: string) => {
      if (!id) {
        return
      }

      const fn = this._itemClickMap[id]
      if (fn) {
        fn()
      }
    })

    this._apiReturnHandle(
      ipcRenderer.invoke(ContextMenuEventName.CREATE_CONTEXT_MENU, this._menuId)
    )
  }

  private async _apiReturnHandle(res: Promise<any>): Promise<any> {
    const resData = (await res) as { error?: boolean; message?: string; data?: any }
    if (resData.error) {
      this._createStatus = 'error'
      this._errMsg = resData.message
      return
    }
    this._createStatus = 'ok'
    return resData.data
  }

  private async _handlerStatus(): Promise<void> {
    if (this._createStatus === 'ok') {
      return
    }

    if (this._createStatus === 'error') {
      throw new Error(this._errMsg)
    }

    await new Promise<void>((resolve, reject) => {
      const intervalId = setInterval(() => {
        console.log('状态判断')
        if (this._createStatus === 'ok') {
          clearInterval(intervalId)
          resolve()
          return
        }

        if (this._createStatus === 'error') {
          reject(Error(this._errMsg))
        }
      }, 100)
    })
  }

  public async appendMenuItem(item: MenuItemOptions): Promise<void> {
    await this._handlerStatus()
    await ipcRenderer.invoke(
      ContextMenuEventName.APPEND_MENU_ITEM,
      JSON.stringify(item),
      this._menuId
    )
  }

  public async popup(): Promise<void> {
    await this._handlerStatus()
    await ipcRenderer.invoke(ContextMenuEventName.MENU_POPUP, this._menuId)
  }

  public registerItemClick(id: string, fn: () => void | any): void {
    this._itemClickMap[id] = fn
  }

  public async clearItems(): Promise<void> {
    await ipcRenderer.invoke(ContextMenuEventName.MENU_ITEM_CLEAR, this._menuId)
  }
}
