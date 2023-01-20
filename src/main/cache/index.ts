import { UserInfo } from '@teamworktoolbox/sdk'
import { loadLocalCacheDatabase } from '../sdk/appSdk/db'
import { sendHttpRequestToLocalServer } from '../tools'

export interface UserListFilterOption {
  /**
   * 跳过应用商店管理员
   */
  breakAppStoreManager?: boolean
}

export class LocalCache {
  public static INSTANCE: LocalCache = new LocalCache()
  /**
   * 数据库
   */
  private _db: PouchDB.Database | undefined

  private _initOk = false

  private constructor() {
    this.init = this.init.bind(this)
    this.flushAll = this.flushAll.bind(this)
    this.flushUserList = this.flushUserList.bind(this)
    this._flushCache = this._flushCache.bind(this)
  }

  public get initOk(): boolean {
    return this._initOk
  }

  public async init(): Promise<void> {
    if (this._initOk) {
      return
    }

    if (!this._db) {
      this._db = (await loadLocalCacheDatabase()).db
    }

    await this._db.createIndex({
      index: {
        fields: ['isAppStoreManager'],
        name: '_userAllList_index'
      }
    })

    this._initOk = true
  }

  public async flushAll(): Promise<void> {
    await this.flushUserList()
  }

  public async flushUserList(): Promise<void> {
    const userInfoList = await sendHttpRequestToLocalServer<UserInfo[]>('/cache/remote/user/list', {
      timeout: -1
    })
    this._flushCache('userAllList', userInfoList)
  }

  private _checkInitOk(): void {
    if (!this._db) {
      throw new Error('数据缓存未被初始化')
    }
  }

  private async _flushCache<T extends { id: string }>(
    cacheName: string,
    newCacheList: T[]
  ): Promise<void> {
    this._checkInitOk()
    cacheName = '_cache_' + cacheName

    const cacheList = await this._db!.allDocs({
      include_docs: true,
      startkey: cacheName,
      endkey: cacheName + '\ufff0'
    })

    for (const r of cacheList.rows) {
      if (r.doc) {
        this._db!.remove(r.doc)
      }
    }

    for (const n of newCacheList) {
      this._db!.put({
        ...n,
        _id: cacheName + '_' + n.id
      })
    }
  }

  //   public userList(filterOptions?: UserListFilterOption): UserInfo[] {
  //     this._checkInitOk()

  //     // if (filterOptions)

  //     this._db!.find({ selector: {} })
  //   }
}
