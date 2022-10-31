import { spawn } from 'child-process-promise'
import { AppInfo } from '../applications/manager'
import { sendHttpRequestToLocalServer } from '../tools'

type EventName = 'lookPath' | 'run' | 'proxy'

export function _execHandler(_appInfo: AppInfo, eventName: EventName, ...data: any): Promise<any> {
  switch (eventName) {
    case 'lookPath':
      return lookPath(data[0])
    case 'run':
      return run(data[0], data[1])
    default:
      throw new Error('未知的命令执行码')
  }
}

async function lookPath(name: string): Promise<string> {
  if (!name) {
    return ''
  }

  return await sendHttpRequestToLocalServer('/exec/lookPath/' + name)
}

async function run(cmd: string, options: { env?: [key: string]; cwd?: string }): Promise<string> {
  options = options || {}
  options.env = {
    ...(process.env as any),
    ...options.env
  }
  const cmdAndArgs = cmd.split(' ')
  const targetCmd = cmdAndArgs.splice(0, 1)[0]

  let stdout: any = ''
  let stderr: any = ''

  const childProcess = spawn(targetCmd, cmdAndArgs, options as any)
  childProcess.childProcess.stdout?.on('data', (data) => {
    stdout += data.toString()
  })

  childProcess.childProcess.stderr?.on('data', (data) => {
    stderr += data.toString()
  })

  const response = await childProcess
  return JSON.stringify({
    stdout,
    stderr,
    exitCode: response.childProcess.exitCode
  })
}
