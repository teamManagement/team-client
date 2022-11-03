import fs from 'fs'
import logs from 'electron-log'
import { app } from 'electron'
import { SYS_USERINFO } from '../consts'
import { packageInfo } from '../consts/packageInfo'
import { asarAbsPath, updaterLocalServerFilePath } from '../process/vars'
import { sendHttpRequestToLocalServer } from '../tools'
import { is } from '@electron-toolkit/utils'

/**
 * 开启更新监听
 */
export function startUpdaterListener(): void {
  setTimeout(async () => {
    for (;;) {
      try {
        logs.debug('开始检查更新')
        const clientServerPath = await sendHttpRequestToLocalServer(
          `/updater/check/${packageInfo.version}`
        )
        logs.debug('检查更新接口返回数据: ', clientServerPath)

        if (typeof clientServerPath !== 'string') {
          throw 'nothing'
        }

        logs.debug('移动需要更新的服务器文件...')
        //   execPath=&asar=${asarAbsPath}&uid=${SYS_USERINFO.uid}&gid=${SYS_USERINFO.gid}
        fs.copyFileSync(clientServerPath, updaterLocalServerFilePath)

        logs.debug('向本地服务发送辅助更新请求')
        await sendHttpRequestToLocalServer(`/updater/update`, {
          jsonData: {
            workDir: app.getAppPath(),
            exec: app.getPath('exe'),
            asar: asarAbsPath,
            uid: SYS_USERINFO.uid,
            gid: SYS_USERINFO.gid,
            debug: is.dev
          }
        })
        logs.debug('向本地服务发送辅助更新请求成功, 自我进行程序退出')
        app.exit(0)
        return
      } catch (e) {
        //nothing
      }

      logs.debug('本次检查更新未发现需要更新, 进入下一次等待')
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, 1000 * 60 * 10)
      })
    }
  }, 0)
}

// import fs from 'fs'
// import logs from 'electron-log'
// import { app } from 'electron'
// import { SYS_USERINFO } from '../consts'
// import { packageInfo } from '../consts/packageInfo'
// import { asarAbsPath, localServerFilePath, updaterLocalServerFilePath } from '../process/vars'
// import { sendHttpRequestToLocalServer } from '../tools'
// import { is } from '@electron-toolkit/utils'
// import { spawnProcess } from '../process'

// /**
//  * 开启更新监听
//  */
// export function startUpdaterListener(): void {
//   if (is.dev) {
//     logs.debug('当前为开发模式, 跳过应用的更新检查')
//     return
//   }
//   setTimeout(async () => {
//     for (;;) {
//       try {
//         logs.debug('开始检查更新')
//         const clientServerPath = await sendHttpRequestToLocalServer(
//           `/updater/check/${packageInfo.version}`
//         )
//         logs.debug('检查更新接口返回数据: ', clientServerPath)

//         if (typeof clientServerPath !== 'string') {
//           throw 'nothing'
//         }

//         logs.debug('移动需要更新的服务器文件...')
//         //   execPath=&asar=${asarAbsPath}&uid=${SYS_USERINFO.uid}&gid=${SYS_USERINFO.gid}
//         fs.copyFileSync(clientServerPath, updaterLocalServerFilePath)

//         logs.debug('向本地服务发送辅助更新请求')
//         const sendData = {
//           workDir: app.getAppPath(),
//           exec: app.getPath('exe'),
//           asar: asarAbsPath,
//           uid: SYS_USERINFO.uid,
//           gid: SYS_USERINFO.gid,
//           debug: is.dev,
//           serverExePath: localServerFilePath
//         }
//         let response = await sendHttpRequestToLocalServer(`/updater/update`, {
//           jsonData: sendData
//         })
//         if (typeof response !== 'boolean') {
//           if (process.platform === 'win32' && typeof response === 'string') {
//             ;(sendData as any).willUpdateAsarPath = response
//             const copyCmd = `${localServerFilePath} -cmd=updater -updateInfo=${Buffer.from(
//               JSON.stringify(sendData),
//               'utf8'
//             ).toString('base64')}`
//             logs.debug('当前为windows自行进行辅助更新, 命令: ', copyCmd)
//             await spawnProcess(copyCmd, {
//               detached: true,
//               stdio: 'ignore' as any
//             })
//             response = true
//           } else {
//             logs.debug(
//               '向本地服务发送辅助更新请求，本地服务拒绝了协助更新，并向我返回了: ',
//               response
//             )
//           }
//         }
//         if (response) {
//           logs.debug('向本地服务发送辅助更新请求成功, 自我进行程序退出')
//           app.exit(0)
//           return
//         }
//       } catch (e) {
//         logs.error('程序更新检查出现错误: ', JSON.stringify(e))
//       }

//       logs.debug('本次检查更新未发现需要更新, 进入下一次等待')
//       await new Promise<void>((resolve) => {
//         setTimeout(() => {
//           resolve()
//         }, 1000 * 60 * 10)
//       })
//     }
//   }, 0)
// }
