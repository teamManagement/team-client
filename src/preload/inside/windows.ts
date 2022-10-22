import { ipcRenderer } from 'electron'

enum WindowsEventName {
  FULLSCREEN = 'WIN-FULLSCREEN',
  UN_FULLSCREEN = 'WIN-UN-FULLSCREEN',
  MAXIMIZE = 'WIN-MAXIMIZE',
  UNMAXIMIZE = 'WIN-UNMAXIMIZE',
  MINIMIZE = 'WIN-MINIMIZE',
  UNMINIMIZE = 'WIN-UN-MINIMIZE',
  ALWAYS_TOP = 'WIN-ALWAYS-TOP',
  UN_ALWAYS_TOP = 'WIN-UN-ALWAYS-TOP'
}

function _ipcCurrentWindowInvoke(name: WindowsEventName): Promise<any> {
  return ipcRenderer.invoke('ipc-win-operation', name)
}

export const currentWindow = {
  fullScreen(): Promise<void> {
    return _ipcCurrentWindowInvoke(WindowsEventName.FULLSCREEN)
  },
  unFullscreen(): Promise<void> {
    return _ipcCurrentWindowInvoke(WindowsEventName.UN_FULLSCREEN)
  },
  maximize(): Promise<void> {
    return _ipcCurrentWindowInvoke(WindowsEventName.MAXIMIZE)
  },
  unMaximize(): Promise<void> {
    return _ipcCurrentWindowInvoke(WindowsEventName.UNMAXIMIZE)
  },
  minimize(): Promise<void> {
    return _ipcCurrentWindowInvoke(WindowsEventName.MINIMIZE)
  },
  unMinimize(): Promise<void> {
    return _ipcCurrentWindowInvoke(WindowsEventName.UNMINIMIZE)
  },
  alwaysOnTop(): Promise<void> {
    return _ipcCurrentWindowInvoke(WindowsEventName.ALWAYS_TOP)
  },
  unAlwaysOnTop(): Promise<void> {
    return _ipcCurrentWindowInvoke(WindowsEventName.UN_ALWAYS_TOP)
  }
}
