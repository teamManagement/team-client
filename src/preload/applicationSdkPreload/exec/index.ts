import {
  tryJsonParseDataHandler,
  sendInvokeIpcEventWrapperEventNameAndDataCallBack
} from '../tools'

const sendInvokeIpcEvent = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'exec',
  tryJsonParseDataHandler
)

export const exec = {
  lookPath(name: string): Promise<string> {
    return sendInvokeIpcEvent('lookPath', name)
  },
  run(
    cmd: string,
    args?: string[],
    options?: { env?: [key: string]; cwd?: string }
  ): Promise<{ exitCode: number; stderr?: string; stdout?: string }> {
    return sendInvokeIpcEvent('run', cmd, args, options)
  }
}
