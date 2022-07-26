import log from 'electron-log'

import { WebSocket as WebSocketInterface } from 'ws'
import { localMessageEncrypt } from '../security'
import { randomBytes2HexStr, uniqueId } from '../security/random'
import AsyncLock from 'async-lock'
import { IpcMainInvokeEvent, ipcMain, WebContents } from 'electron'
import { alertMsgAndRelaunch as alertMsgAndBreakToLogin } from '../windows/alerts'
import { CurrentInfo, WinNameEnum } from '../current'
import { SettingLoginWin } from '../windows/login'
import { clearAllApplicationViews } from '../sdk/insideSdk/applications'
import { closeAllDb } from '../sdk/appSdk/db'
import { clearAllWsNotification, sendNotification } from './notices'
import { showNotification } from '../notification'
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
  data?: string
  errMsg: string
}

type LoginStatusListenerHandle = (status: 'login' | 'logout') => void

export class WsHandler {
  private _onlineUserList: string[] = []
  private _retryNum = 0
  private _loginStatusListener: LoginStatusListenerHandle[] = []
  private _messageCallbackMap: MessageCallbackMap = {}

  private _serverPushMsgTransferHandlerList: {
    sender?: WebContents
    handler?(): void
  }[] = []

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

  public static get onlineUserIdList(): string[] {
    return [...WsHandler.instance._onlineUserList]
  }

  public static initServerMsgTransferEvents(): void {
    ipcMain.handle('ipc-serverMsgTransferEvent', (event: IpcMainInvokeEvent) => {
      return lock.acquire('ipc-serverMsgTransferEvent', (done) => {
        try {
          const sender = event.sender
          const list = WsHandler.instance._serverPushMsgTransferHandlerList
          for (const w of list) {
            if (w.sender && w === sender) {
              return
            }
          }
          list.push({
            sender
          })
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

  public registerLoginStatusListener = (fn: LoginStatusListenerHandle): void => {
    for (const _fn of this._loginStatusListener) {
      if (fn === _fn) {
        return
      }
    }

    this._loginStatusListener.push(fn)
  }

  public unRegisterLoginStatusListener = (fn: LoginStatusListenerHandle): void => {
    for (let i = 0; i < this._loginStatusListener.length; i++) {
      if (this._loginStatusListener[i] === fn) {
        this._loginStatusListener.splice(0, 1)
        return
      }
    }
  }

  private _invokeLoginStatusChange = (status: 'login' | 'logout'): void => {
    for (const _fn of this._loginStatusListener) {
      _fn(status)
    }
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
      const mockData = JSON.stringify({ cmdCode: 2, dataType: 0 })
      const list = WsHandler.instance._serverPushMsgTransferHandlerList
      for (const w of list) {
        w.sender && w.sender.send('ipc-serverMsgTransferEvent', mockData)
      }
      this._invokeLoginStatusChange('login')
      log.debug('用户回复之后的状态已向渲染进程进行推送')
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
                const list = WsHandler.instance._serverPushMsgTransferHandlerList

                const data = JSON.parse(serverData) as TcpTransferInfo
                let msgData: string | undefined = data.data
                if (msgData) {
                  msgData = Buffer.from(msgData, 'base64').toString('utf8')
                }
                log.debug('接收到TCP Transfer数据: ', serverData)
                if (data.cmdCode === 1) {
                  this._loginOk = false
                  alertMsgAndBreakToLogin(
                    '服务器断开连接, 并无法自动恢复, 点击确认之后将跳转至登录, 请尝试再次手动登录'
                  )
                  return
                }

                if (data.cmdCode === 3) {
                  if (!msgData) {
                    return
                  }

                  const statusMsgSplit = msgData.split('__')
                  if (statusMsgSplit.length !== 2) {
                    return
                  }

                  const userId = statusMsgSplit[0]
                  const status = statusMsgSplit[1]
                  if (status === 'online') {
                    if (this._onlineUserList.includes(userId)) {
                      return
                    }
                    this._onlineUserList.push(userId)
                  } else {
                    const index = this._onlineUserList.indexOf(userId)
                    if (index < 0) {
                      return
                    }
                    this._onlineUserList.splice(index, 1)
                  }

                  sendNotification('userOnlineStatus', status, userId, this._onlineUserList)

                  return
                }

                if (data.cmdCode === 4) {
                  console.log('进入....')
                  showNotification('template', {
                    title: '他处登录',
                    body: `您当前的帐号正在: ${msgData} 上尝试登录, 是否允许进行登录?`,
                    // duration: 1000 * 15,
                    duration: -1,
                    theme: 'warning',
                    closable: true,
                    position: 'center',
                    btns: [
                      {
                        title: {
                          tml: '允许( {{=it.data.val-=1}}s{{it.data.val<=0 && it.click();}} )',
                          data: {
                            val: 9
                          },
                          repeat: 9,
                          repeatInterval: 1000
                        },
                        theme: 'danger'
                      }
                      // {
                      //   title: '拒绝',
                      //   theme: 'success'
                      // }
                    ]
                  })
                }

                for (const w of list) {
                  w.sender && w.sender.send('ipc-serverMsgTransferEvent', serverData)
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
        const mockData = JSON.stringify({ cmdCode: 0, dataType: 0 })
        const list = WsHandler.instance._serverPushMsgTransferHandlerList
        for (const w of list) {
          w.sender && w.sender.send('ipc-serverMsgTransferEvent', mockData)
        }
        this._invokeLoginStatusChange('logout')
        log.debug('连接断开消息已推送至渲染进程中')
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

  public _callbackDataAndReceiveSyn(id: string, data: any): Promise<MessageContent> {
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

  public async logout(): Promise<void> {
    log.debug('帐号登出...')
    await this.sendDataAdnReceiveSync('logout', undefined)
    this._loginOk = false

    log.debug('重置窗体到登录界面')
    CurrentInfo.getWin(WinNameEnum.HOME)?.hide()
    SettingLoginWin()
    CurrentInfo.getWin(WinNameEnum.HOME)?.destroy()
    CurrentInfo.setWin(WinNameEnum.HOME, undefined)
  }

  public clearWebContentResource(webContent: WebContents): void {
    log.debug('开始清除WsHandler中的WebContent资源, 要被清除的WebContentId => ', webContent.id)
    const webContentList = WsHandler.instance._serverPushMsgTransferHandlerList
    for (let i = webContentList.length - 1; i >= 0; i--) {
      if (webContentList[i] === webContent) {
        log.debug('WebContentId => ', webContent.id, ', 从TCP Transfer通道中被移除')
        webContentList.splice(i, 1)
      }
    }

    clearAllApplicationViews()
    closeAllDb()
    clearAllWsNotification()
  }
}
