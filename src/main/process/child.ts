import fs from 'fs'
import logs from 'electron-log'
import os from 'os'
import process from 'process'
import { spawn, SpawnOptionsWithoutStdio } from 'child_process'
import { localServerFilePath, mkcertFilePath, packageLocalServerFilePath } from './vars'
import path from 'path'
import { is } from '@electron-toolkit/utils'
import { USER_LOCAL_CONFIG_DIR } from '../consts'
import { fileToSha512 } from '../tools'

const caCrt = `-----BEGIN CERTIFICATE-----
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
l/yHSoovDsL0yeFeKL7gi2pcnRsXrNa4K08=
-----END CERTIFICATE-----`

const caKey = `-----BEGIN PRIVATE KEY-----
MIIJQwIBADANBgkqhkiG9w0BAQEFAASCCS0wggkpAgEAAoICAQDypLe9fuuK7lXg
vTBzHksPkVvsicx9RtFnFjUMbEo4scOxPi8cMWIOe9IQMPnvzany6776OW40m0aM
bq7AeTknsju/rh5WyQ2tFnGlSxVYEhGp/WhaHnbL+AtYmcWyVn3FK/JWp/Aq9OgQ
yf9geLZOLH3fddtfc6z/3s5eKJttC7zwGuhXqQPlBRr3Ex0QotngD2r/2Kv4oULQ
hewQkTTd9oZcPkFtzMuvfeIewFjlG4auTLHyLWOggfUIjSJaLQr+fvdjButzEOpU
kqEpqayAurrIEGA0vSY7xVxL0mTh2qgbNt0Hv/gK2tGbqqzKFrw1jqxFUOFOnlij
cNStR5niUL/uJD5vMLRw8tATH+tOmyTvRyETGT/a9iF/lK/2GcsMSzd+UaQn9KwE
/4INWfU8nnYZcybLcQLN99KD5JmuaiSiCqWJ9FfDntwM8U7rM97P4S6u7SzcjtxD
WhYPOQJN3FVCPRC7Pm28RB1srb7PrZPlUVjkvq0SDmNIMb6rGhteeCnTnHwrhtbq
Yi2S636+zpPXRosZ9VTR194bG3nXygXbqBBiR6IxoubpeP3VSCfMrgDz1coBA/sC
xlArRwzU7ZypB32p4E708biO9lgetrQL3x5fE6dFY8u0AK3HJC2LKKVRGpr1iD6e
JnNM07aBQRUR6wLqBYt6ECoyJ4BwhQIDAQABAoICAAERinJ4oV55RKaL7YF/9y1L
qxnl+/ZhhmrhESS2O8eK+zgvOWSuMqH5kTrm8kKdm9EzqzVV4gzOaPZQw9j8V+GD
hk2NInJtXXzPHiw0xh5t7JuAjpNG6wqFSeUkuFCaT9oq+zV2qaGkih7F1SeyE6v1
aBIwZi1pZGStjOAMRl8meMmrR74Cxi7VmyoqONTdcu5NPb8XEUp/Raj2NtYbRtLF
nNQJ2s/us7N83vPuWxeAUlaMv7u0jjU71KiZ1zmkkDATGpL+aROQF6xjcHQRlFRD
nWz6whjhJy3isOD82wi/BOyFjRXOxF2YYmYL2Wc6RLx/5euRgWTn1tzvCJZEWauz
KAUAmvPTprbMYx4dAqg6gOUb6bNtGRwXhXsxPMHNCdNZf7OgBc8rce4c6SFWzHEG
j9KHsEFxtB0tRBBIQOyABqwqa51067qfUPYoF2F6SSx9DwlvCQenfg7Tx/hPRKqW
Q04dlHR46UiuiUbjBaktX+h7T1fLx/fixHcWBATrbk6GJOKtZwHYrDFQFWoULbRN
doCmirsP/YURRiHj5ClnOcFgD7ErWquQZCXqrQha7ysO5srJnyAaCgGx6I4mOehS
xVSlFK3RTYm9wEulg1arJunGy3kPO7ADQTOCi7x2km39IXiHFFdY8BkSslXqBCd5
LtTpUmxu4kd8Rd3+X9BnAoIBAQD6q/cGpUlKmX7gS9Ai5cYC52/fl7t+v1bHM7m9
dr0ZXlLMmyN7N2QvlFLQHqfNab0hrTk+qhLKrrWjRvNfJsB8HgOJy+hkC/tD3vi4
Ff76D6u4oatI3W9NQYO2rRHIPNkMfyU1EwTx6O7k5WQCDEweY3BHmqvFyJweee25
a6aMpOS7n9TvZ2z19m2uGAV9jLQ1zlW57Rjbztj1XLA2AyOPguT6PQe4YGRolHKv
ezsFF/OLC7U41pzdlm31rG3Yi8Wot1JZLw+OR3WtyqZQMiYE78p61vT0EYuD7PzX
rgrTovK4v2JyQ5RODv+mC3fmWc29o1s8h3gRSl4cOI80YVB3AoIBAQD3zREMGjQR
UU3TFrOHK5PqVyfq9pcLpYA5IhDllggRB5alibJi+bkpV1FSQYCE0Cj/sEmGXSu6
LaY5xDN0OB1cvZCDQDQtNFFOFhllfs/i5LW1uc4A2wMIBUuunvwAQ7bJuQ0tjyaM
MSUwQ/mH1SLUczET3FVK75rwHKiLvuUnFSWI4xtRTX+huuRgsePbA/VAKVVFnK76
amOI0Ulw6MSIrhPC3IIsamS4NNPsKSe9LcOJJR/cCpjfnlOXUVevV/ZGJY1+cyb8
9Ojw5v6HRk0BSctnA7VfXlpL92uFPJ1NWZKhEse+JPxzBv/QXXbiomY/SvbgvvaQ
1Pv8HWNHT2HjAoIBAQDQ3Z68I9bY2OMV4zWvDkOaQds+tAAfUTDuVJQsYRaZX7Wg
FJhQ38uTtYP3M8Pf7X4Q5HQxWabEySRBwymgG/sAsEWEeKnPSwh2+f/F61YEaDBO
bC77TL6j4bXs7XJGpSS5O+v1uD5DjzIW+WgGKNb37yUsFJ2R9GDZKAFDoYYp5G9O
QpQ7UrNAkq+7Avr4LNgviRh3Di7LYCP49d1BdAYaWxeNxnJ7V53yYdbZjtWTnexo
7D14+aHFJMXEkYMJjxUISo/MDeFpTPOp9pPzeIWjUWYmSpvaDhBwwXPABp2w0DJs
a9OMn/CfxfGQGjgycJt0qvuniL0rswqNezcfjwJrAoIBAGzCWGUTax7erGWlZQ5C
lh0YO7Doocq+zNRGm1voyYmP5xKoqN6/9ACtDkgn75xbMGNooByU8Ag62OYpstuj
dV+q4653k27zs2uuT184lU1kTEyCTGQbu+zdRiZSKRCEp8lJqvsABU8qksPoUbDI
Xw0Xscahwd2t5DbWnTMYicLpiRvXcbnxZb86I9o8uWD7D70lZwOyjSnjX+RA1xbz
Uq8amBnCZm/QEny20vyn44UofNXIsX8GN6qN9upHDVEsLi8DdGK3b7k+VK7G85ez
x0B1fwyrmANPiholcc98lx3H3o9LitdtrE9gFw8Atpkp5e6JnGlv5xASKrawv04h
DTkCggEBAINdg6qTCkdXYaIbKtVKlgd99AKImuINzk4CEh6JW7L0simMQT9/miUS
zrE3ZebmA+5W0faeuo7HYHZpq83gKO5GEIqKfmgg5fLgZiuRCJ9yErIFEN6EVvRy
QQ16Quk9AYv3btcqwyQFRAa+gIvUJYITfWE2WQqZfSAqxY6ecn/yzMt05Y9w9/6V
ssgXdBqFb1usKk334Hd7lWpf9u6ZLYpBwduch1wx4Bmh0aIoWE3vYjedJPAudQt8
87eS4618MsLTzsobEAu7kuAP6NA4g2320qq5xGlDN/5u260BNIppxtab7II5FgiT
a77dR/qpLAvtxWgPURANHO6hcMAPfsc=
-----END PRIVATE KEY-----`

export function spawnProcess(
  cmd: string,
  options?: SpawnOptionsWithoutStdio & {
    withAdmin?: boolean
  }
): Promise<number> {
  return new Promise<number>((resolve) => {
    const cmdSplit = cmd.split(' ')
    try {
      fs.chmodSync(cmdSplit[0], '0755')
    } catch (_e) {
      //ignore
    }

    options = options || {}

    options.env = options.env || {}

    options.env = { ...process.env, ...options.env }
    options.cwd = options.cwd || path.dirname(cmdSplit[0])
    logs.debug(
      `执行子进程, 命令: ${cmdSplit[0]} ${JSON.stringify(
        cmdSplit.slice(1)
      )}, Options: ${JSON.stringify(options)}`
    )
    const child = spawn(cmdSplit[0], cmdSplit.slice(1), options)
    child.stderr.on('data', (d) => {
      logs.debug('子命令输出错误信息: ', d.toString())
    })
    child.addListener('exit', (code) => {
      resolve(code || 0)
    })
  })
}

export async function installLocalServer(): Promise<boolean> {
  if (is.dev) {
    logs.debug('检测到是开发环境, 取消本地服务的启动')
    return true
  }

  let stat: fs.Stats
  try {
    try {
      stat = fs.statSync(localServerFilePath)
    } catch (e) {
      fs.copyFileSync(packageLocalServerFilePath, localServerFilePath)
      stat = fs.statSync(localServerFilePath)
    }
    if (
      stat.isFile() &&
      (await fileToSha512(localServerFilePath)) !== (await fileToSha512(packageLocalServerFilePath))
    ) {
      await spawnProcess(`${localServerFilePath} -cmd=stop -configDir=${USER_LOCAL_CONFIG_DIR}`)
      await spawnProcess(
        `${localServerFilePath} -cmd=uninstall -configDir=${USER_LOCAL_CONFIG_DIR}`
      )
      try {
        fs.unlinkSync(localServerFilePath)
      } catch (e) {
        //nothing
      }

      try {
        fs.copyFileSync(packageLocalServerFilePath, localServerFilePath)
      } catch (e) {
        logs.error('将包内本地服务包移动至用户目录下失败: ', JSON.stringify(e))
        return false
      }
    }
  } catch (e) {
    logs.error('本地服务检测失败: ', JSON.stringify(e))
    return false
  }

  await spawnProcess(`${localServerFilePath} -cmd=stop -configDir=${USER_LOCAL_CONFIG_DIR}`)
  await spawnProcess(`${localServerFilePath} -cmd=uninstall -configDir=${USER_LOCAL_CONFIG_DIR}`)
  if (
    (await spawnProcess(
      `${localServerFilePath} -cmd=install -configDir=${USER_LOCAL_CONFIG_DIR}`
    )) !== 0
  ) {
    logs.error('本地服务安装失败')
    return false
  }
  if (
    (await spawnProcess(
      `${localServerFilePath} -cmd=start -configDir=${USER_LOCAL_CONFIG_DIR}`
    )) !== 0
  ) {
    logs.error('启动本地服务失败')
    return false
  }

  // const startResultCode = await spawnProcess(`${localServerFilePath} -cmd=check`)
  // if (startResultCode !== 0) {
  //   logs.error('启动本地服务失败')
  //   if (startResultCode === 255) {
  //     alertPanic('本地服务组件资源被占用, 请联系管理员进行问题排查!!')
  //   }
  //   return false
  // }

  // setTimeout(async () => {
  //   for (;;) {
  //     const startResultCode = await spawnProcess(`${localServerFilePath}`)
  //     if (startResultCode !== 0) {
  //       logs.error('启动本地服务失败')
  //       if (startResultCode === 255) {
  //         alertPanic('本地服务组件资源被占用, 请联系管理员进行问题排查!!')
  //       }
  //     }
  //   }
  // }, 0)

  return true
}

export async function installCaCert(): Promise<boolean> {
  let tempDir: string | undefined = undefined
  let caCrtFile: string | undefined = undefined
  let caKeyFile: string | undefined = undefined

  try {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'team-'))

    logs.debug('创建CA根临时存储目录: ', tempDir)
    caCrtFile = path.join(tempDir, 'rootCA.pem')
    caKeyFile = path.join(tempDir, 'rootCA-key.pem')

    fs.writeFileSync(caCrtFile, caCrt)
    fs.writeFileSync(caKeyFile, caKey)

    const env = {
      CAROOT: tempDir
    }

    const execCmd = `${mkcertFilePath} -install`
    logs.debug(`执行CA根安装命令: ${execCmd}, 环境变量: ${JSON.stringify(env)}`)
    return (await spawnProcess(execCmd, { env })) === 0
  } catch (e) {
    logs.debug('安装CA根发生错误: ', JSON.stringify(e))
    return false
  } finally {
    if (tempDir) {
      logs.debug('删除CA根临时存储目录')
      unlinkFileIgnoreErr(caCrtFile!)
      unlinkFileIgnoreErr(caKeyFile!)
      try {
        fs.rmdirSync(tempDir!)
      } catch (e) {
        //ignore
      }
    }
  }
}

function unlinkFileIgnoreErr(filepath: string): void {
  try {
    fs.unlinkSync(filepath)
  } catch (_e) {
    // ignore
  }
}
