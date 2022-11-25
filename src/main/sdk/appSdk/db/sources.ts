import fs from 'fs'
import path from 'path'
import logs from 'electron-log'
import { UserInfo } from '@byzk/teamwork-sdk'
import { sendHttpRequestToLocalServer } from '../../../tools'
import { AppInfo } from '../../insideSdk/applications'
import { CORE_COUCHDB_URL, USER_LOCAL_CONFIG_DIR } from '../../../consts'
import PouchdbStatic from 'pouchdb-node'
const Pouchdb = require('pouchdb') as typeof PouchdbStatic
Pouchdb.plugin(require('pouchdb-find'))

export class Database {
  private _db: PouchDB.Database | undefined
  private _dbSync: PouchDB.Replication.Sync<any> | undefined
  private _nowUser: UserInfo | undefined
  private _cachePasswd: string | undefined
  private _cachePath: string | undefined
  private _isDestroy = false

  public constructor(private _appInfo: AppInfo) {
    this.init = this.init.bind(this)
    this._closeSync = this._closeSync.bind(this)
    this.destroy = this.destroy.bind(this)
  }

  public async init(): Promise<Database> {
    try {
      if (!this._nowUser || !this._db || !this._cachePasswd) {
        this._nowUser = await sendHttpRequestToLocalServer<UserInfo>('/user/now')
        this._cachePasswd = await sendHttpRequestToLocalServer<string>('/user/cache/p')
        this._cachePath = path.join(
          USER_LOCAL_CONFIG_DIR,
          'apps',
          this._nowUser.id,
          this._appInfo.id,
          'db'
        )
        fs.mkdirSync(this._cachePath, {
          recursive: true
        })
        this._db = new Pouchdb(this._cachePath)
      }
      if (this._appInfo.id === '0') {
        logs.debug('当前要创建同步库的应用为应用商店, 跳过远程数据库的同步')
        return this
      }

      this._dbSync = this._db.sync(`${CORE_COUCHDB_URL}/u${this._nowUser.id}_${this._appInfo.id}`, {
        live: true,
        retry: true,
        // filter(doc, params) {
        //   console.log('sync doc: ', doc, ', params: ', params)
        // },
        auth: {
          username: this._nowUser.id,
          password: this._cachePasswd
        }
      } as PouchDB.Replication.SyncOptions)
      this._dbSync.addListener('error', (e: any) => {
        this._closeSync()
        logs.info('连接远程同步库失败: ', JSON.stringify(e))
        setTimeout(() => {
          if (this._isDestroy) {
            return
          }
          logs.debug('应用远程同步库尝试重连...')
          this.init()
        }, 5000)
      })
      return this
    } catch (e) {
      this.destroy()
      throw e
    }
  }

  public destroy(): void {
    this._closeSync()
    this._db && this._db.close()
    this._isDestroy = true
    logs.debug('应用数据库被销毁...')
  }

  public get db(): PouchDB.Database {
    this._serviceDataCheck()
    if (!this._db) {
      throw new Error('数据库未初始化成功')
    }
    return this._db
  }

  private _closeSync(): void {
    this._dbSync && this._dbSync.cancel()
    this._dbSync = undefined
  }

  private _serviceDataCheck(): void {
    if (this._isDestroy) {
      throw new Error('数据库连接已被销毁')
    }
  }
}

export function createDatabase(appInfo: AppInfo): Promise<Database> {
  return new Database(appInfo).init()
}
