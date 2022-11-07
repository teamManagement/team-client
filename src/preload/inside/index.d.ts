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
    url: string
    icon: string
    iconType: IconType
    desc: string
    shortDesc: string
    version: string
    loading?: boolean
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
    click?: () => void
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

  class Menu {
    public constructor(menuItems: MenuItemOptions[], menuId?: string)
    items(): MenuItem[] | undefined
    popup(): Promise<void>
    click(itemId: string): void
    id(): string
  }

  //#endregion

  interface Window {
    teamworkInsideSdk: {
      electron: ElectronAPI
      id: {
        seq(): number
        uuid(): string
      }
      // contextmenu: {
      //   build(menuItems: MenuItemOptions[], menuId?: string): Menu
      //   clear(id: string): void
      //   clearAll(): void
      // }
      api: {
        login(username: string, password: string): Promise<void>
        logout(): void
        proxyHttpCoreServer<T>(url: string, options?: HttpOptions): Promise<T>
        proxyHttpLocalServer<T>(url: string, options?: HttpOptions): Promise<T>
        registerServerMsgHandler<T>(fn: (data: TcpTransferInfo<T>) => void): string
        removeServerMsgHandler(fnId: string): void
      }
      currentWindow: {
        fullScreen(): Promise<void>
        unFullscreen(): Promise<void>
        maximize(): Promise<void>
        unMaximize(): Promise<void>
        minimize(): Promise<void>
        unMinimize(): Promise<void>
        alwaysOnTop(): Promise<void>
        unAlwaysOnTop(): Promise<void>
        show(): Promise<void>
        hide(): Promise<void>
        close(): Promise<void>
      }
      applications: {
        getOpenedIdList(): string[]
        listenStatusNotice(
          id: string,
          fn: (appInfo: AppInfo, status: 'open' | 'close') => void
        ): void
        removeStatusNotice(id: string): void
        openApp(appInfo: AppInfo): Promise<void>
        showById(id: string): Promise<void>
        showInAlertById(id: string): Promise<void>
        currentShowInAlert(): Promise<void>
        hideById(id: string): Promise<void>
        hangUp(): Promise<void>
        restore(): Promise<AppInfo>
        hideEndOpenedApp(): Promise<void>
        destroyById(id: string): Promise<void>
        destroyAlertById(id: string): Promise<void>
        getCurrentAppInfo(): AppInfo | undefined
      }
    }

    // & {
    //   ContextMenu: {
    //     get(): ContextMenu
    //     getById(menuId: string): ContextMenu
    //   }
    // }
    // api: {
    //   login(username: string, password: string): Promise<void>
    //   contextmenu: {
    //     build(menuItems: MenuItemOptions[], menuId?: string): Menu
    //     clear(menuId: string): void
    //     clearAll(): void
    //   }
    // }
    // proxyApi: ProxyApi
    // app: {
    //   getOpenedIdList(): string[]
    //   listenStatusNotice(id: string, fn: (appInfo: AppInfo, status: 'open' | 'close') => void): void
    //   removeStatusNotice(id: string): void
    //   openApp(appInfo: AppInfo): Promise<void>
    //   showById(id: string): Promise<void>
    //   showInAlertById(id: string): Promise<void>
    //   currentShowInAlert(): Promise<void>
    //   hideById(id: string): Promise<void>
    //   hangUp(): Promise<void>
    //   restore(): Promise<AppInfo>
    //   hideEndOpenedApp(): Promise<void>
    //   destroyById(id: string): Promise<void>
    //   destroyAlertById(id: string): Promise<void>
    //   getCurrentAppInfo(): AppInfo | undefined
    // }
    // modalWindow: {
    //   showInside(url: string, options: BrowserWindowConstructorOptions, attachInfo?: any): void
    // }
  }
}
