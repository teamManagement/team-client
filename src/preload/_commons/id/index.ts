import crypto from 'crypto'
import { sendInvokeIpcEventWrapperEventNameAndDataCallBack } from '../../inside/tools'
import { tryJsonParseDataHandler } from '../tools'

const sendInvokeIpcEvent = sendInvokeIpcEventWrapperEventNameAndDataCallBack(
  'api',
  tryJsonParseDataHandler
)

interface IdInterface {
  seq(): number
  uuid(): string
  unique(): Promise<string>
}

let _seq = 0

function seq(): number {
  _seq += 1
  return _seq
}

function uuid(): string {
  return crypto.randomUUID({ disableEntropyCache: true })
}

function unique(): Promise<string> {
  return sendInvokeIpcEvent('proxyHttpLocalServer', '/id/create')
}

export const id = {
  seq,
  uuid,
  unique
} as IdInterface
