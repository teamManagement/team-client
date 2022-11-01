import { IpcMainInvokeEvent } from 'electron'

export function ipcEventPromiseWrapper(
  res: (event: IpcMainInvokeEvent, ...data: any) => Promise<any>
): (event: IpcMainInvokeEvent, ...data: any) => Promise<any> {
  return async (event, ...reqData: any) => {
    try {
      let data = await res(event, ...reqData)
      if (data) {
        data = JSON.stringify(data)
      }

      return { error: false, data }
    } catch (e: any) {
      if (typeof e === 'string') {
        return { error: true, msg: e }
      }
      const err = e as Error
      return { error: true, msg: err.message }
    }
  }
}
