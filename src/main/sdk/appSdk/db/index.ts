import { IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import fs from 'fs'
import { SdkHandlerParam } from '../..'
import { AppInfo } from '../../insideSdk/applications'
import { loadInsideDatabase } from './sources'
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
   * @param db 数据库
   * @param data 数据
   * @returns 添加结果
   */
  put(
    db: PouchDB.Database,
    data: Required<{ _id: string; _rev?: string }>
  ): Promise<PouchDB.Core.Response> {
    if (typeof data !== 'object') {
      return Promise.reject('db存储支持存储JSON Object对象')
    }
    return dbErrorWrapper(db.put(data))
  },
  post(db: PouchDB.Database, data: object): Promise<PouchDB.Core.Response> {
    if (typeof data !== 'object') {
      return Promise.reject('db存储支持存储JSON Object对象')
    }
    return dbErrorWrapper(db.post(data))
  },
  get(db: PouchDB.Database, id: string): Promise<any> {
    if (typeof id !== 'string') {
      return Promise.resolve(undefined)
    }
    return dbErrorWrapper(db.get(id))
  },
  async remove(db: PouchDB.Database, id: string): Promise<PouchDB.Core.Response> {
    if (typeof id !== 'string') {
      throw new Error('未被支持的key类型')
    }

    return await dbErrorWrapper(db.remove(await dbErrorWrapper(db.get(id))))
  },
  bulkDocs(
    db: PouchDB.Database,
    data: any[]
  ): Promise<(PouchDB.Core.Response | PouchDB.Core.Error)[]> {
    return db.bulkDocs(data)
  },

  async allDocs(db: PouchDB.Database, keys: string | string[]): Promise<any[]> {
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

  getAttachment(db: PouchDB.Database, docId: string): Promise<any> {
    return dbErrorWrapper(db.getAttachment(docId, getAttachmentId(docId)))
  },
  async getAttachmentType(db: PouchDB.Database, docId: string): Promise<any> {
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
  async removeAttachment(db: PouchDB.Database, docId: string): Promise<any> {
    const dataRes = await dbErrorWrapper(db.get(docId))
    return dbErrorWrapper(db.removeAttachment(docId, getAttachmentId(docId), dataRes._rev))
  },
  indexCreate(
    db: PouchDB.Database,
    index: {
      /** List of fields to index */
      fields: string[]

      /** Name of the index, auto-generated if you don't include it */
      name?: string | undefined

      /** Design document name (i.e. the part after '_design/', auto-generated if you don't include it */
      ddoc?: string | undefined

      /** Only supports 'json', and it's also the default */
      type?: string | undefined

      /** The same syntax as the selector you’d pass to find(), and only documents matching the selector will be included in the index. */
      partial_filter_selector?: PouchDB.Find.Selector | undefined
    }
  ): Promise<any> {
    return db.createIndex({ index })
  },
  async indexList(db: PouchDB.Database): Promise<any> {
    return (await db.getIndexes()).indexes
  },
  async indexDelete(
    db: PouchDB.Database,
    indexOptions: PouchDB.Find.DeleteIndexOptions
  ): Promise<any> {
    return db.deleteIndex(indexOptions)
  },
  async indexFind(db: PouchDB.Database, options: PouchDB.Find.FindRequest<any>): Promise<any> {
    return db.find(options)
  }
}

function _handler(db: PouchDB.Database, eventName: string, ...data: any): Promise<any> {
  const handler = eventHandlerMap[eventName]
  if (!handler) {
    throw new Error('未知的db操作指令')
  }
  return handler(db, ...data)
}

export async function _dbHandler(appInfo: AppInfo, eventName: string, ...data: any): Promise<any> {
  return _handler(appInfo.db.db, eventName, ...data)
}

export async function _insideDbHandler(
  _event: IpcMainInvokeEvent,
  eventName: string,
  ...data: any
): Promise<any> {
  const insideDb = await loadInsideDatabase()
  return _handler(insideDb.db, eventName, ...data)
}

export function _dbSyncHandler(param: SdkHandlerParam<IpcMainEvent, void>): any {
  const appInfo = (param.event.sender as any)._appInfo as AppInfo
  if (!appInfo) {
    throw new Error('未知的应用信息')
  }

  return _handler(appInfo.db.db, param.eventName, ...param.otherData)
}

export async function _insideSyncHandler(param: SdkHandlerParam<IpcMainEvent, void>): Promise<any> {
  const insideDb = await loadInsideDatabase()
  return _handler(insideDb.db, param.eventName, ...param.otherData)
}
