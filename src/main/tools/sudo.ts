import os from 'os'
import fs from 'fs'
import path from 'path'
import { exec } from 'sudo-prompt'

/**
 * sudo执行命令
 * @param cmd 要执行的命令
 */
export function sudoExec(cmd: string): Promise<{ stdout?: string; stderr?: string }> {
  return new Promise<{ stdout?: string; stderr?: string }>((resolve, reject) => {
    exec(cmd, { name: 'teamwork' }, (err, stdout, stderr) => {
      stdout = stdout && stdout.toString()
      stderr = stderr && stderr.toString()
      if (err) {
        const _err = err as any
        _err.stdout = stdout
        _err.stderr = stderr
        reject(_err)
        return
      }

      resolve({ stderr, stdout })
    })
  })
}

/**
 * sudo执行linux Bash脚本
 * @param shellStr 要执行的shell脚本字符串
 * @param args 参数
 * @returns 结果
 */
export async function sudoLinuxBashShellStr(
  shellStr: string,
  ...args: string[]
): Promise<{ stdout?: string; stderr?: string }> {
  const temDir = fs.mkdtempSync(path.join(os.tmpdir(), 'team-'))
  const shellPath = path.join(temDir, '_teamworkShell.sh')
  args = args || []
  try {
    fs.writeFileSync(shellPath, shellStr)
    fs.chmodSync(shellPath, '0755')
    return await sudoExec(`${shellPath} ${args.join(' ')}`)
  } finally {
    try {
      fs.unlinkSync(shellPath)
    } catch (_e) {
      //noting
    }

    try {
      fs.unlinkSync(temDir)
    } catch (_e) {
      //noting
    }
  }
}
