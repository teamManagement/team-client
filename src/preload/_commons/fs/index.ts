import { promises } from 'fs'
import { fileTypeFromBuffer } from 'file-type'

interface FsInterface {
  /**
   * 读取文件到base64字符串
   * @param localPath 本地文件的路径
   */
  readFileToBase64Str(localPath: string): Promise<string>
  /**
   * 读取文件到text
   * @param localPath 要读取的文件
   */
  readFileText(localPath: string): Promise<string>
}

export const fs: FsInterface = {
  async readFileToBase64Str(localPath) {
    const fileContent = await promises.readFile(localPath)
    const fileType = (await fileTypeFromBuffer(fileContent)) || 'application/octet-stream'
    return `data:${fileType};base64,` + fileContent.toString('base64')
  },
  async readFileText(localPath) {
    return (await promises.readFile(localPath)).toString('utf-8')
  }
}
