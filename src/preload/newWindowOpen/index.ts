import { ipcRenderer } from 'electron'

ipcRenderer.addListener('ipc-url-new-window-handler', (_event, url) => {
  location.href = url
})
