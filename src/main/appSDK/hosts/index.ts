import fs from 'fs'
import { AppInfo } from '../../applications/manager'
import { sudExec as sudoExec } from '../../tools'

type EventName = 'add' | 'export' | 'cover' | 'clear' | 'addToHeader' | 'delete'

const hostsFilePath =
  process.platform === 'win32'
    ? `${process.env.windir || 'C:\\WINDOWS'}\\system32\\drivers\\etc\\hosts`
    : '/etc/hosts'

const newLine = process.platform === 'win32' ? '\r\n' : '\n'

export function _hostsHandler(_appInfo: AppInfo, eventName: EventName, ...data: any): Promise<any> {
  switch (eventName) {
    case 'add':
      return add(data[0])
    case 'export':
      return exportHosts()
    case 'cover':
      return cover(data[0])
    case 'clear':
      return clear()
    case 'addToHeader':
      return addToHeader(data[0])
    case 'delete':
      return deleteByDnsOrIp(data[0])
    default:
      return Promise.reject(new Error('非法的hosts指令'))
  }
}

async function checkHosts(): Promise<void> {
  if (process.platform === 'win32') {
    return
  }
  try {
    fs.accessSync(hostsFilePath, fs.constants.R_OK | fs.constants.W_OK)
  } catch (e) {
    await sudoExec('chmod 666 ' + hostsFilePath)
  }
  fs.accessSync(hostsFilePath, fs.constants.R_OK | fs.constants.W_OK)
}

async function add(line: string[]): Promise<void> {
  checkHosts()
  fs.appendFileSync(hostsFilePath, line.join(newLine) + newLine)
}

async function addToHeader(lines: string[]): Promise<void> {
  if (!lines || lines.length <= 0) {
    return
  }
  const originStr = await exportHosts()
  await cover(lines.join(newLine) + newLine + originStr)
}

async function exportHosts(): Promise<string> {
  checkHosts()
  return fs.readFileSync(hostsFilePath).toString('utf-8')
}

async function cover(hostsContent: string): Promise<void> {
  checkHosts()
  return fs.writeFileSync(hostsFilePath, hostsContent)
}

async function clear(): Promise<void> {
  checkHosts()
  return fs.writeFileSync(hostsFilePath, '')
}

async function deleteByDnsOrIp(dnsName: string): Promise<void> {
  if (typeof dnsName !== 'string' || dnsName.length <= 0) {
    return
  }
  const allText = await exportHosts()
  // split the contents by new line
  cover(
    allText
      .split(/\r?\n/)
      .filter((l) => {
        return !l.split(' ').includes(dnsName)
      })
      .join(newLine) + newLine
  )
}
;[]
