import log from 'electron-log'

import { WebSocket as WebSocketInterface } from 'ws'
import { localMessageEncrypt } from '../security'
import { randomBytes2HexStr, uniqueId } from '../security/random'
const WebSocket = require('ws')

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
  [key: string]: (content: MessageContent) => void
}

export class WsHandler {
  private _retryNum = 0
  private _messageCallbackMap: MessageCallbackMap = {}

  private _ws: WebSocketInterface | undefined = undefined
  private _connectionOk = false
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

    log.debug('本地消息隧道连接成功')
    this._retryNum = 0
    this._connectionOk = true
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
        }
      })
      this._ws!.addListener('error', (err) => {
        if (err.message.includes('connect ECONNREFUSED')) {
          console.log('连接失败需要重启本地服务')
        }

        log.warn('socket连接发生错误: ', JSON.stringify(err))
        this._connectionOk = false
      })
      this._ws!.addListener('close', () => {
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
      this.registryCallback(messageContent.id, (data) => {
        delete this._messageCallbackMap[messageContent.id]
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

      this.registryCallback(messageContent.id, (data) => {
        delete this._messageCallbackMap[messageContent.id]
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

  public registryCallback(id: string, cb: (data: any) => void): void {
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
    log.debug('检测登录状态, 返回数据: ', JSON.stringify(response))
    return response.data
  }
}
