import { IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import { SdkHandlerParam } from '../..'
import { AppInfo } from '../../insideSdk/applications'

function decodeBase64(base64Str: string): Buffer {
  return Buffer.from(base64Str, 'base64')
}

function decodeHex(hexStr: string): Buffer {
  return Buffer.from(hexStr, 'hex')
}

const encodingMap = {
  base64(str: string): string {
    return Buffer.from(str, 'utf-8').toString('base64')
  },
  base64Decode(base64Str: string): string {
    return decodeBase64(base64Str).toString('utf-8')
  },
  base64DecodeToBuffer(base64Str: string): Buffer {
    return decodeBase64(base64Str)
  },
  hex(str: string): string {
    return Buffer.from(str, 'utf-8').toString('hex')
  },
  hexDecode(hexStr: string): string {
    return decodeHex(hexStr).toString('utf-8')
  },
  hexDecodeToBuffer(hexStr: string): Buffer {
    return decodeHex(hexStr)
  }
}

function _handler(eventKey: string, ...data: any): any {
  const handler = encodingMap[eventKey]
  if (!handler) {
    throw new Error('未知的encoding指令')
  }
  return handler(...data)
}

export function _encodingHandler(param: SdkHandlerParam<IpcMainInvokeEvent, AppInfo>): any {
  return _handler(param.eventName, ...param.otherData)
}

export function _encodingSyncHandler(param: SdkHandlerParam<IpcMainEvent, void>): any {
  return _handler(param.eventName, ...param.otherData)
}
