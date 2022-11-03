import { BrowserWindow, ipcMain, IpcMainInvokeEvent, Menu, MenuItem, KeyboardEvent } from 'electron'

enum ContextMenuEventName {
  CREATE_CONTEXT_MENU = 'ipc-context-menu-create',
  APPEND_MENU_ITEM = 'ipc-context-menu-item-create',
  MENU_POPUP = 'ipc-context-menu-popup',
  MENU_ITEM_CLICK = 'ipc-context-menu-item-click',
  MENU_ITEM_CLEAR = 'ipc-context-menu-item-clear'
}

const contextMenuMap: { [KEY: string]: Menu } = {}

async function returnWrapper(
  res: Promise<any>
): Promise<{ error?: boolean; message?: string; data?: any }> {
  try {
    return { data: await res }
  } catch (e) {
    return { error: true, message: (e as Error).message || (e as any) }
  }
}

export function initContextMenuApiProxy(): void {
  ipcMain.handle(ContextMenuEventName.CREATE_CONTEXT_MENU, (event, menuId?: string) =>
    returnWrapper(createContentMenu(event, menuId))
  )

  ipcMain.handle(
    ContextMenuEventName.APPEND_MENU_ITEM,
    (event, menuitemOptions: string, menuId?: string) =>
      returnWrapper(appendMenuItem(event, menuitemOptions, menuId))
  )

  ipcMain.handle(ContextMenuEventName.MENU_POPUP, (event, menuId?: string) =>
    returnWrapper(popup(event, menuId))
  )

  ipcMain.handle(ContextMenuEventName.MENU_ITEM_CLEAR, (event, menuId?: string) =>
    returnWrapper(clearItems(event, menuId))
  )
}

function checkMenuId(event: IpcMainInvokeEvent, menuId?: string): string {
  return menuId || event.sender.id + ''
}

function getMenuById(event: IpcMainInvokeEvent, menuId?: string): Menu {
  menuId = checkMenuId(event, menuId)
  const menu = contextMenuMap[menuId]
  if (!menu) {
    throw new Error('未初始化的Menu对象')
  }
  return menu
}

/**
 * 创建上下文菜单
 * @param event 事件对象
 * @param menuId 菜单Id
 * @returns void
 */
async function createContentMenu(event: IpcMainInvokeEvent, menuId?: string): Promise<any> {
  menuId = checkMenuId(event, menuId)

  if (contextMenuMap[menuId]) {
    return
  }

  contextMenuMap[menuId] = new Menu()
}

interface MenuItemOptions {
  click?: (
    menuItem: MenuItem,
    browserWindow: BrowserWindow | undefined,
    event: KeyboardEvent
  ) => void
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
  submenu?: MenuItemOptions[]
  id?: string
  before?: string[]
  after?: string[]
  beforeGroupContaining?: string[]
  afterGroupContaining?: string[]
}

async function appendMenuItem(
  event: IpcMainInvokeEvent,
  menuItemOptionsJsonStr: string,
  menuId?: string
): Promise<any> {
  const menu = getMenuById(event, menuId)
  const menuItemOptions = JSON.parse(menuItemOptionsJsonStr) as MenuItemOptions
  if (menuItemOptions.id) {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    menuItemOptions.click = () => {
      // BrowserWindow.getFocusedWindow()?.webContents.send(
      event.sender.send(ContextMenuEventName.MENU_ITEM_CLICK, menuItemOptions.id)
    }
  }

  menu.append(new MenuItem(menuItemOptions))
}

async function popup(event: IpcMainInvokeEvent, menuId?: string): Promise<void> {
  const menu = getMenuById(event, menuId)
  menu.popup({
    window: BrowserWindow.fromWebContents(event.sender) || (BrowserWindow.getFocusedWindow() as any)
  })
}

async function clearItems(event: IpcMainInvokeEvent, menuId?: string): Promise<void> {
  menuId = menuId || event.sender.id + ''
  delete contextMenuMap[menuId]
  contextMenuMap[menuId] = new Menu()
}
