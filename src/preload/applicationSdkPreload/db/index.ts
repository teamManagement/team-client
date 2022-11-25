import { tryJsonParseDataHandler } from '../../_commons/tools'
import { sendInvokeIpcEventWrapperEventNameAndDataCallBack } from '../tools'

const sendInvokeIpcEvent = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'db',
  tryJsonParseDataHandler
)

export interface BasicResponse {
  /** `true` if the operation was successful; `false` otherwise */
  ok: boolean
}

export interface Response extends BasicResponse {
  /** id of the targeted document */
  id: string
  /** resulting revision of the targeted document */
  rev: string
}

function isBase64(str: string): boolean {
  if (str === '' || str.trim() === '') {
    return false
  }
  try {
    return window.btoa(window.atob(str)) == str
  } catch (err) {
    return false
  }
}

async function getAttachment(id: string): Promise<Buffer | Uint8Array | string> {
  if (typeof id !== 'string' || !id) {
    throw new Error('id不能为空')
  }
  const buffer = await sendInvokeIpcEvent('getAttachment', id)
  return Buffer.from(buffer)
}

async function getAttachmentToBlob(id: string): Promise<Blob> {
  const buffer = await getAttachment(id)
  return new Blob([buffer])
}

export const db = {
  async put<T extends { _id: string; _rev?: string }>(data: T): Promise<Response> {
    if (!data || typeof data !== 'string') {
      throw new Error('数据必要信息缺失')
    }
    return await sendInvokeIpcEvent('put', data)
  },
  async post(data: any): Promise<any> {
    if (!data) {
      throw new Error('要添加的数据不能为空')
    }
    return await sendInvokeIpcEvent('post', data)
  },
  async get<T extends { _rev: string }>(id: string): Promise<T> {
    if (typeof id !== 'string') {
      throw new Error('不支持的id类型')
    }
    return await sendInvokeIpcEvent('get', id)
  },
  async remove(id: string): Promise<Response> {
    if (typeof id !== 'string') {
      throw new Error('不支持的删除ID类型')
    }
    return await sendInvokeIpcEvent('remove', id)
  },
  async bulkDocs(data: any[]): Promise<any[]> {
    if (!(data instanceof Array)) {
      throw new Error('批量操作的数据必须为数组类型')
    }
    return await sendInvokeIpcEvent('bulkDocs', data)
  },
  async allDocs(keys: any): Promise<any[]> {
    if (
      !(keys instanceof Array<string>) &&
      typeof keys !== 'string' &&
      typeof keys !== 'undefined'
    ) {
      throw new Error('不支持的key类型')
    }
    return await sendInvokeIpcEvent('allDocs', keys)
  },
  async putAttachmentByLocalFilepath(id: string, localPath: string): Promise<any> {
    if (typeof id !== 'string' || !id) {
      throw new Error('id不能为空')
    }

    if (typeof id !== 'string' || !localPath) {
      throw new Error('本地文件路径不能为空')
    }

    return await sendInvokeIpcEvent('putAttachmentByLocalFilepath', id, localPath)
  },
  async putAttachment(
    docId: string,
    data: Buffer | Uint8Array | string,
    type: string
  ): Promise<any> {
    if (typeof docId !== 'string') {
      throw new Error('Id不能为空')
    }

    if (!(data instanceof Buffer) && !(data instanceof Uint8Array) && typeof data !== 'string') {
      throw new Error('不支持的附件类型')
    }

    if (typeof data === 'string' && !isBase64(data)) {
      throw new Error('数据类型为字符串时只能存放base64')
    }

    if (typeof type !== 'string') {
      throw new Error('附件类型只能存放字符串')
    }

    return await sendInvokeIpcEvent('putAttachment', docId, data, type)
  },
  getAttachment,
  async getAttachmentType(id: string): Promise<any> {
    if (typeof id !== 'string' || !id) {
      throw new Error('不支持的id类型')
    }
    return await sendInvokeIpcEvent('getAttachmentType', id)
  },
  getAttachmentToBlob,
  async getAttachmentToBlobUrl(id: string): Promise<string> {
    const blob = await getAttachmentToBlob(id)
    return window.URL.createObjectURL(blob)
  }
}
