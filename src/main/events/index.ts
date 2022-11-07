import { _initMainProcessEvents } from './main'
import { _initModalWindowsEvents } from './modalWindows'
import { _initWindowsEvent } from './win'

export * from './main'

export function initMainProcessEvents(): void {
  _initMainProcessEvents()
  _initWindowsEvent()
  _initModalWindowsEvents()
}
