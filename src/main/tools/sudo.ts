import { exec } from 'sudo-prompt'

/**
 * sudo执行命令
 * @param cmd 要执行的命令
 */
export function sudExec(cmd: string): Promise<{ stdout?: string; stderr?: string }> {
  return new Promise<{ stdout?: string; stderr?: string }>((resolve, reject) => {
    exec(cmd, { name: 'teamwork' }, (err, stdout, stderr) => {
      if (err) {
        reject(err)
        return
      }

      stdout = stdout && stdout.toString()
      stderr = stderr && stderr.toString()
      resolve({ stderr, stdout })
    })
  })
}
