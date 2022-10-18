import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  //#region APP相关接口
  enum AppType {
    REMOTE_WEB,
    LOCAL_WEB
  }

  enum IconType {
    URL,
    ICON_FONT
  }

  interface AppInfo {
    id: string
    name: string
    inside: boolean
    type: AppType
    remoteSiteUrl: string
    icon: string
    iconType: IconType
    desc: string
    shortDesc: string
    version: string
  }
  //#endregion

  //#region 网络代理相关接口
  interface HttpOptions {
    method?: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'OPTION'
    jsonData?: any
    header?: { [key: string]: string }
  }

  interface ResponseError {
    error?: boolean
    httpCode: number
    code: string
    message: string
    raw: string
  }

  interface TcpTransferInfo<T> {
    cmdCode: number
    data: T
    errMsg: string
  }

  enum TcpTransferCmdCode {
    BLOCKING_CONNECTION,
    RESTORE_SERVER_ERR,
    RESTORE_SERVER_OK
  }

  interface ProxyApi {
    httpWebServerProxy<T>(url: string, options?: HttpOptions): Promise<T>
    httpLocalServerProxy<T>(url: string, options?: HttpOptions): Promise<T>
    registerServerMsgHandler<T>(fn: (data: TcpTransferInfo<T>) => void): Promise<void>
    removeServerMsgHandler(fn: (data: TcpTransferInfo<any>) => void): void
  }
  //#endregion

  //#region electronApi代理
  interface MenuItemOptions {
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

  interface ContextMenu {
    appendMenuItem(item: MenuItemOptions): Promise<void>
    registerItemClick(id: string, fn: () => void | any): void
    clearItems(): Promise<void>
    popup(): Promise<void>
  }

  //#endregion

  interface Window {
    electron: ElectronAPI & {
      ContextMenu: {
        get(): ContextMenu
        getById(menuId: string): ContextMenu
      }
    }
    api: {
      login(username: string, password: string): Promise<void>
    }
    proxyApi: ProxyApi
  }
}
