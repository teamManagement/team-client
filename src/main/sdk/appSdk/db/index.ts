import fs from 'fs'
import { AppInfo } from '../../insideSdk/applications'
const { fromBuffer } = require('file-type-cjs')

// const { fileTypeFromFile } = require('file-type') as { fileTypeFromFile: typeof _fileTypeFromFile }

export * from './sources'

async function dbErrorWrapper<T>(res: Promise<T>): Promise<T> {
  try {
    return await res
  } catch (e) {
    const _err = e as PouchDB.Core.Error
    if (!_err.error || typeof _err.status !== 'number') {
      throw new Error('未知的db异常')
    }

    if (_err.reason) {
      _err.reason = _err.reason + ': '
    }

    switch (_err.status) {
      case 404:
        throw new Error('not found')
      case 409:
        throw new Error('数据更新冲突')
      default:
        throw new Error(
          '未能处理的db状态码: ' + _err.status + ', 错误信息: ' + (_err.reason || '') + _err.message
        )
    }
  }
}

function getAttachmentId(id: string): string {
  return id + '_attachment'
}

const eventHandlerMap = {
  /**
   * 向数据库内添加一个值
   * @param _appInfo 应用信息
   * @param db 数据库
   * @param data 数据
   * @returns 添加结果
   */
  put(
    _appInfo: AppInfo,
    db: PouchDB.Database,
    data: Required<{ _id: string; _rev?: string }>
  ): Promise<PouchDB.Core.Response> {
    if (typeof data !== 'object') {
      return Promise.reject('db存储支持存储JSON Object对象')
    }
    return dbErrorWrapper(db.put(data))
  },
  post(_appInfo: AppInfo, db: PouchDB.Database, data: object): Promise<PouchDB.Core.Response> {
    if (typeof data !== 'object') {
      return Promise.reject('db存储支持存储JSON Object对象')
    }
    return dbErrorWrapper(db.post(data))
  },
  get(_appInfo: AppInfo, db: PouchDB.Database, id: string): Promise<any> {
    if (typeof id !== 'string') {
      return Promise.resolve(undefined)
    }
    return dbErrorWrapper(db.get(id))
  },
  async remove(
    _appInfo: AppInfo,
    db: PouchDB.Database,
    id: string
  ): Promise<PouchDB.Core.Response> {
    if (typeof id !== 'string') {
      throw new Error('未被支持的key类型')
    }

    return await dbErrorWrapper(db.remove(await dbErrorWrapper(db.get(id))))
  },
  bulkDocs(
    _appInfo: AppInfo,
    db: PouchDB.Database,
    data: any[]
  ): Promise<(PouchDB.Core.Response | PouchDB.Core.Error)[]> {
    return db.bulkDocs(data)
  },
  async allDocs(_appInfo: AppInfo, db: PouchDB.Database, keys: string | string[]): Promise<any[]> {
    let queryResult: PouchDB.Core.AllDocsResponse<any>
    const keyType = typeof keys
    if (keyType === 'string') {
      queryResult = await dbErrorWrapper(
        db.allDocs({
          include_docs: true,
          startkey: keys as any,
          endkey: keys + '\ufff0'
        })
      )
    } else if (keyType === 'undefined') {
      queryResult = await dbErrorWrapper(db.allDocs({ include_docs: true }))
    } else if (keys instanceof Array) {
      queryResult = await dbErrorWrapper(
        db.allDocs({
          include_docs: true,
          keys: keys
        })
      )
    } else {
      return []
    }

    if (!queryResult || queryResult.rows.length === 0) {
      return []
    }

    const res: any[] = []
    for (const row of queryResult.rows) {
      res.push(row.doc || row.value)
    }

    return res
  },
  async putAttachment(
    _appInfo: AppInfo,
    db: PouchDB.Database,
    docId: string,
    data: PouchDB.Core.AttachmentData,
    type: string
  ): Promise<any> {
    try {
      await db.get(docId)
      throw new Error('数据ID已存在')
    } catch (e) {
      //nothing
    }
    return await dbErrorWrapper(db.putAttachment(docId, getAttachmentId(docId), data, type))
  },
  async putAttachmentByLocalFilepath(
    _appInfo: AppInfo,
    db: PouchDB.Database,
    id: string,
    localPath: string,
    type?: string
  ): Promise<any> {
    try {
      await db.get(id)
      throw new Error('数据ID已存在')
    } catch (e) {
      //nothing
    }

    let fileData: Buffer
    try {
      fileData = fs.readFileSync(localPath)
    } catch (e) {
      throw new Error(`获取文件: ${localPath} 内容失败, 错误信息: ${(e as any).message || e}`)
    }

    let fileType: string = type || ''
    try {
      if (!fileType) {
        const fileResult = await fromBuffer(fileData)
        if (!fileResult) {
          throw new Error('获取文件类型失败')
        }
        fileType = fileResult.mime
      }
    } catch (e) {
      throw new Error('获取文件类型失败, 错误信息: ' + ((e as any).message || e))
    }

    return await dbErrorWrapper(db.putAttachment(id, getAttachmentId(id), fileData, fileType))
  },

  getAttachment(_appInfo: AppInfo, db: PouchDB.Database, docId: string): Promise<any> {
    return dbErrorWrapper(db.getAttachment(docId, getAttachmentId(docId)))
  },
  async getAttachmentType(_appInfo: AppInfo, db: PouchDB.Database, docId: string): Promise<any> {
    const data = await dbErrorWrapper(db.get(docId))
    if (!data._attachments) {
      throw new Error('不存在附件信息')
    }

    const attachmentInfo = data._attachments[getAttachmentId(docId)]
    if (!attachmentInfo) {
      throw new Error('附件文件信息不存在')
    }
    return attachmentInfo.content_type
  },
  async removeAttachment(_appInfo: AppInfo, db: PouchDB.Database, docId: string): Promise<any> {
    const dataRes = await dbErrorWrapper(db.get(docId))
    return dbErrorWrapper(db.removeAttachment(docId, getAttachmentId(docId), dataRes._rev))
  }
}

export async function _dbHandler(appInfo: AppInfo, eventName: string, ...data: any): Promise<any> {
  const handler = eventHandlerMap[eventName]
  if (!handler) {
    throw new Error('未知的db操作指令')
  }
  return handler(appInfo, appInfo.db.db, ...data)
}
