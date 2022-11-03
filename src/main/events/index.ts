import { ipcMain } from 'electron'
import { _initAppSDK } from '../appSDK'
import { WsHandler } from '../socket'
import { _initMainProcessEvents } from './main'
import { _initModalWindowsEvents } from './modalWindows'
import { _initWindowsEvent } from './win'

export * from './main'

export function initMainProcessEvents(): void {
  _initMainProcessEvents()
  _initWindowsEvent()
  _initModalWindowsEvents()
  _initAppSDK()
  ipcMain.addListener('ipc_LOGOUT', () => {
    WsHandler.instance.logout()
  })
}
