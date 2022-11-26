import { ipcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import { ipcEventPromiseWrapper, ipcEventSyncWrapper } from '../tools/ipc'
import { _initAppSdk } from './appSdk'
import { _initInsideSdk } from './insideSdk'

/**
 * sdk参数
 */
export interface SdkHandlerParam<T, E> {
  /**
   * 事件信息
   */
  event: T
  /**
   * 子事件名称
   */
  eventName: any
  /**
   * 上一步处理结果
   */
  prevData: E
  /**
   * 其他数据
   */
  otherData: any[]
}

export interface EventSyncHandleMap<T> {
  [key: string]:
    | ((param: SdkHandlerParam<IpcMainEvent, T>) => Promise<any> | any)
    | EventSyncHandleMap<T>
}

/**
 * 注册信息
 */
export interface SdkRegistryInfo<P> {
  /**
   * 要注册的事件名称
   */
  name: string
  /**
   * 异步处理
   */
  eventPromiseHandleMap?: {
    [key: string]: (param: SdkHandlerParam<IpcMainInvokeEvent, P>) => Promise<any> | any
  }
  /**
   * 同步事件处理
   */
  eventSyncHandleMap?: EventSyncHandleMap<P>
  /**
   * 前置处理器
   */
  prevHandle?(param: SdkHandlerParam<IpcMainEvent | IpcMainInvokeEvent, P>): Promise<P> | P
}

/**
 * sdk注册方法函数
 */
export type RegisterFn = (info: SdkRegistryInfo<any>) => void

/**
 * sdk注册信息列表
 */
const sdkRegistryInfoList: SdkRegistryInfo<any>[] = []

/**
 * sdk注册信息方法
 * @param registryInfo 注册信息
 */
function _sdkRegistryFn(registryInfo: SdkRegistryInfo<any>): void {
  sdkRegistryInfoList.push(registryInfo)
}

/**
 * 处理前置数据并提取子事件名称
 * @param info 信息
 * @param param 参数
 * @returns 需要处理的子事件名称
 */
async function _handlePrevData(
  info: SdkRegistryInfo<any>,
  param: SdkHandlerParam<IpcMainEvent | IpcMainInvokeEvent, any>
): Promise<string> {
  if (!param.otherData || param.otherData.length === 0) {
    throw new Error('缺失子事件名称')
  }

  const childEventName = param.otherData.splice(0, 1)[0]
  if (!info.prevHandle) {
    param.prevData = undefined
    return childEventName
  }

  const prevRes = info.prevHandle(param)
  if (prevRes instanceof Promise) {
    param.prevData = await prevRes
    return childEventName
  }

  param.prevData = prevRes
  return childEventName
}

/**
 * 事件统一处理
 * @param info 信息
 * @param event 事件对象
 * @param data 数据
 * @returns 处理结果
 */
async function _eventHandler(
  isPromise: boolean,
  info: SdkRegistryInfo<any>,
  event: IpcMainEvent | IpcMainInvokeEvent,
  ...data: any
): Promise<any> {
  const param: SdkHandlerParam<IpcMainInvokeEvent, any> = {
    event,
    otherData: data
  } as any

  const childEventName = await _handlePrevData(info, param)
  let handlerMap: any = info.eventPromiseHandleMap
  if (!isPromise) {
    handlerMap = info.eventSyncHandleMap
  }

  const childEventNameArray = childEventName.split('.')
  let handler: any = handlerMap
  for (const eventName of childEventNameArray) {
    handler = handler[eventName]
    if (!handler) {
      throw new Error('未知的处理方式')
    }
  }

  if (typeof handler !== 'function') {
    throw new Error('未知的处理方式')
  }

  return handler(param)
}

/**
 * 初始化sdk
 */
export function initSdk(): void {
  _initInsideSdk(_sdkRegistryFn)
  _initAppSdk(_sdkRegistryFn)

  for (const info of sdkRegistryInfoList) {
    if (info.eventPromiseHandleMap) {
      ipcMain.handle(
        info.name,
        ipcEventPromiseWrapper((event, ...data) => _eventHandler(true, info, event, ...data))
      )
    } else if (info.eventSyncHandleMap) {
      ipcMain.addListener(
        info.name,
        ipcEventSyncWrapper((event, ...data) => _eventHandler(false, info, event, ...data))
      )
    } else {
      continue
    }
  }
}
