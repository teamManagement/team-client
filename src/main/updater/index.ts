import { packageInfo } from '../consts/packageInfo'
import { sendHttpRequestToLocalServer } from '../tools'

/**
 * 开启更新监听
 */
export async function startUpdaterListener(): Promise<void> {
  for (;;) {
    try {
      const response = await sendHttpRequestToLocalServer(`/updater/check/${packageInfo.version}`)
    } catch (e) {
      //nothing
    }

    await new Promise()
  }
}
