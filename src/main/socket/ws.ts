import log from 'electron-log'

import { WebSocket as WebSocketInterface } from 'ws'
import { localMessageEncrypt } from '../security'
import { randomBytes2HexStr, uniqueId } from '../security/random'
import AsyncLock from 'async-lock'
import { IpcMainInvokeEvent, ipcMain, WebContents } from 'electron'
import { alertMsgAndRelaunch as alertMsgAndBreakToLogin } from '../windows/alerts'
const WebSocket = require('ws')

const lock = new AsyncLock()

enum MessageType {
  PUSH,
  CALLBACK
}

interface MessageContent {
  id: string
  type: MessageType
  data: any
}

interface MessageCallbackMap {
  [key: string]: (content: MessageContent, err?: Error) => void
}

interface TcpTransferInfo {
  cmdCode: number
  errMsg: string
}

export class WsHandler {
  private _retryNum = 0
  private _messageCallbackMap: MessageCallbackMap = {}

  private _serverPushMsgTransferWebContentList: WebContents[] = []

  private _ws: WebSocketInterface | undefined = undefined
  private _connectionOk = false
  private _loginOk = false

  public get connectionOk(): boolean {
    return this._connectionOk
  }

  private static _instance: WsHandler | undefined

  public static get instance(): WsHandler {
    if (!WsHandler._instance) {
      WsHandler._instance = new WsHandler()
    }
    return WsHandler._instance
  }

  public static initServerMsgTransferEvents(): void {
    ipcMain.handle('ipc-serverMsgTransferEvent', (event: IpcMainInvokeEvent) => {
      return lock.acquire('ipc-serverMsgTransferEvent', (done) => {
        try {
          const sender = event.sender
          const list = WsHandler.instance._serverPushMsgTransferWebContentList
          for (const w of list) {
            if (w === sender) {
              return
            }
          }
          list.push(sender)
        } finally {
          done(undefined)
        }
      })
    })
  }

  private constructor() {
    log.debug('初始化socket链接')
    this._connection()
  }

  private _handshake = async (conn: WebSocketInterface): Promise<void> => {
    const clientRandom = randomBytes2HexStr(16)
    const clientRandomSendData = localMessageEncrypt(clientRandom)
    const serverResponse = await this._sendDataReceiveSync('conn', clientRandomSendData)

    if (!serverResponse.data.startsWith(clientRandom)) {
      conn.close()
      return
    }

    const serverRandom = serverResponse.data.substring(clientRandom.length)

    const serverEndResult = await this._callbackDataAndReceiveSyn(serverResponse.id, serverRandom)
    if (serverEndResult.data !== 'ok') {
      conn.close()
      return
    }

    this._connectionOk = true
    log.debug('本地消息隧道连接成功')
    if (this._loginOk) {
      try {
        log.debug('用户上次的状态为登录成功, 正在尝试恢复登录状态...')
        await this.autoLogin()
      } catch (e) {
        log.error(
          '用户上次的状态为登录成功, 在通道恢复时尝试自动登录失败, 将进行通道重连, 本次错误消息: ',
          JSON.stringify(e)
        )
        this._ws?.close()
        return
      }
      log.debug('用户状态回复成功')
    }
    this._retryNum = 0
  }

  private _clearResources(err?: Error): void {
    lock.acquire('clear', (done) => {
      try {
        for (const key in this._messageCallbackMap) {
          const cb = this._messageCallbackMap[key]
          cb({} as any, err)
          delete this._messageCallbackMap[key]
        }
      } finally {
        done()
      }
    })
  }

  private _connection(): void {
    try {
      this._ws = new WebSocket('wss://127.0.0.1:65528/ws', {
        rejectUnauthorized: false,
        headers: {
          'User-Agent': 'teamManagerLocalView'
        }
      })
      this._ws!.addListener('open', this._handshake)
      this._ws!.addListener('message', (message) => {
        const msg = JSON.parse(message.toString()) as MessageContent
        switch (msg.type) {
          case MessageType.CALLBACK:
            if (this._messageCallbackMap[msg.id]) {
              const cb = this._messageCallbackMap[msg.id]
              delete this._messageCallbackMap[msg.id]
              cb(msg)
              return
            }
            break
          case MessageType.PUSH:
            lock.acquire('ipc-serverMsgTransferEvent', (done) => {
              const buf = Buffer.from(msg.data, 'base64')
              const serverData = buf.toString('utf8')
              try {
                const list = WsHandler.instance._serverPushMsgTransferWebContentList

                const data = JSON.parse(serverData) as TcpTransferInfo
                log.debug('接收到TCP Transfer数据: ', serverData)
                if (data.cmdCode === 1) {
                  this._loginOk = false
                  alertMsgAndBreakToLogin(
                    '服务器断开连接, 并无法自动恢复, 点击确认之后将跳转至登录, 请尝试再次手动登录'
                  )
                  return
                }

                for (const w of list) {
                  w.send('ipc-serverMsgTransferEvent', serverData)
                }
              } catch (e) {
                log.error(
                  'TCP服务通道转发的数据内容失败, 内容: ',
                  buf.toString('utf8'),
                  ' , 错误信息: ',
                  JSON.stringify(e)
                )
              } finally {
                done()
              }
            })
        }
      })
      this._ws!.addListener('error', (err) => {
        if (err.message.includes('connect ECONNREFUSED')) {
          log.debug('连接失败需要重启本地服务')
        }

        log.warn('socket连接发生错误: ', JSON.stringify(err))
        this._connectionOk = false
        this._clearResources(err)
      })
      this._ws!.addListener('close', () => {
        this._clearResources()
        this._connectionOk = false
        log.warn('socket连接被断开')
        setTimeout(() => {
          this._retryNum += 1
          log.info('正在尝试重连socket连接')
          this._connection()
        }, 3000)
      })
    } catch (e) {
      console.log(e)
    }
  }

  private _generatorMessageContent<T>(data: T, type = MessageType.PUSH): MessageContent {
    return {
      type,
      data,
      id: uniqueId()
    }
  }

  private async _sendMessageContent(
    messageContent: MessageContent,
    reject: (err: any) => void
  ): Promise<void> {
    try {
      if (!this._ws) {
        throw new Error('本地消息隧道连接失败！')
      }
      this._ws.send(JSON.stringify(messageContent), (err) => {
        if (err) {
          reject(err)
        }
      })
    } catch (e) {
      reject(e)
    }
  }

  private _sendDataReceiveSync(
    cmd: string,
    data: any,
    type = MessageType.PUSH
  ): Promise<MessageContent> {
    return new Promise<MessageContent>((resolve, reject) => {
      const messageContent = this._generatorMessageContent(data, type)
      this.registryCallback(messageContent.id, (data, err) => {
        delete this._messageCallbackMap[messageContent.id]
        if (err) {
          reject(err)
          return
        }
        resolve(data)
      })
      messageContent.id = cmd + ':' + messageContent.id
      this._sendMessageContent(messageContent, reject)
    })
  }

  public _callbackDataAndReceiveSyn<T>(id: string, data: any): Promise<MessageContent> {
    return new Promise<MessageContent>((resolve, reject) => {
      const messageContent = {
        id,
        data,
        type: MessageType.CALLBACK
      } as MessageContent

      this.registryCallback(messageContent.id, (data, err) => {
        delete this._messageCallbackMap[messageContent.id]
        if (err) {
          reject(err)
          return
        }
        resolve(data)
      })

      this._sendMessageContent(messageContent, reject)
    })
  }

  public callbackDataAndReceiveSync(id: string, data: any): Promise<MessageContent> {
    if (!this._ws || !this._connectionOk) {
      return Promise.reject(new Error('本地消息隧道连接失败'))
    }
    return this._callbackDataAndReceiveSyn(id, data)
  }

  public sendDataAdnReceiveSync(
    cmd: string,
    data: any,
    type = MessageType.PUSH
  ): Promise<MessageContent> {
    if (!this._ws || !this._connectionOk) {
      return Promise.reject(new Error('本地消息隧道连接失败'))
    }

    return this._sendDataReceiveSync(cmd, data, type)
  }

  public registryCallback(id: string, cb: (data: any, err?: Error) => void): void {
    this._messageCallbackMap[id] = cb
  }

  public waitConnection(retryNum = 1): Promise<boolean> {
    if (this._connectionOk) {
      return Promise.resolve(true)
    }

    retryNum = retryNum + this._retryNum
    return new Promise<boolean>((resolve) => {
      const intervalId = setInterval(() => {
        let breakPromise = false
        let result = false
        if (this._connectionOk) {
          breakPromise = true
          result = true
        } else if (this._retryNum >= retryNum) {
          result = false
          breakPromise = true
        }
        if (breakPromise) {
          clearInterval(intervalId)
          resolve(result)
          return
        }
      }, 1000)
    })
  }

  public async loginOk(): Promise<boolean> {
    const response = await this.sendDataAdnReceiveSync('checkIsLogin', '')
    return response.data
  }

  public async login(username: string, password: string): Promise<void> {
    const dataPack =
      Buffer.from(username, 'utf-8').toString('base64') +
      '.' +
      Buffer.from(password, 'utf-8').toString('base64')
    const response = await this.sendDataAdnReceiveSync('login', dataPack)
    if (response.data.error) {
      throw new Error(response.data.message)
    }
    this._loginOk = true
  }

  public async autoLogin(): Promise<boolean> {
    log.debug('尝试进行自动登录')
    const response = await this.sendDataAdnReceiveSync('autoLogin', undefined)
    log.debug('自动登录结果: ', JSON.stringify(response))
    if (response.data.error) {
      throw new Error(response.data.message)
    }
    this._loginOk = true
    return response.data
  }

  public clearWebContentResource(webContent: WebContents): void {
    log.debug('开始清除WsHandler中的WebContent资源, 要被清除的WebContentId => ', webContent.id)
    const webContentList = WsHandler.instance._serverPushMsgTransferWebContentList
    for (let i = webContentList.length - 1; i >= 0; i--) {
      if (webContentList[i] === webContent) {
        log.debug('WebContentId => ', webContent.id, ', 从TCP Transfer通道中被移除')
        webContentList.splice(i, 1)
      }
    }
  }
}
