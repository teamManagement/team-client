import { EMsgItem, EMsgType, IFilePayload } from './interface'
import ZIPImg from './images/ZIP@2x.png'
import EXCELImg from './images/EXCEL@2x.png'
import PPTImg from './images/PPT@2x.png'
import WORDImg from './images/WORD@2x.png'
import OTHERImg from './images/未知文件@2x.png'

/**
 * 合并文本
 * @param text 要合并的文本
 * @param result 结果
 */
function mergeText(text: string, result: Array<EMsgItem>): void {
  const lastItem = result.slice(-1)[0]
  if (lastItem?.type === EMsgType.text) {
    lastItem.data += text
  } else if (text === '\n') {
    return
  } else {
    result.push({
      type: EMsgType.text,
      data: text
    })
  }
}

/**
 * 通过html解析出消息列表
 * */
export function getMsgListByNode(
  el: Node | null,
  findFile: (fileId: string) => string | IFilePayload | undefined,
  result: EMsgItem[] = []
): EMsgItem[] {
  if (!el) {
    return result
  }

  Array.from(el.childNodes).forEach((child) => {
    if (child.nodeName === '#text' || child.nodeName === 'SPAN') {
      // 1.处理文本类型
      const text =
        child.nodeName === '#text' ? `${child.nodeValue}` : (child as HTMLSpanElement).innerHTML
      mergeText(text, result)
    } else if (child.nodeName === 'BR') {
      mergeText('\n', result)
    } else if (child.nodeName === 'IMG') {
      const imgNode = child as HTMLImageElement
      // 2.处理图片类型
      const fileid = imgNode.getAttribute('id') || ''

      switch (imgNode.title) {
        case 'img':
          // 2.1图片
          if (fileid) {
            result.push({
              type: EMsgType.img,
              data: findFile(fileid)
            })
          }
          break
        case 'file':
          // 2.2文件
          if (fileid) {
            result.push({
              type: EMsgType.file,
              data: findFile(fileid)
            })
          }
          break
        default:
          // 2.3 emoji
          mergeText(`${imgNode.alt}`, result)
          break
      }
    } else if (child.nodeName === 'DIV') {
      // 递归
      getMsgListByNode(child, findFile, result)
    }
  })
  return result
}

/**
 * 获取标准的背景img
 * */
let baseImgFlag = false
const baseImg = new Image()
baseImg.src =
  'data:image/png;base64,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'
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
baseImg.onload = () => (baseImgFlag = true)
export function getBackImg(): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    if (baseImgFlag) {
      resolve(baseImg)
    }

    const time = setInterval(() => {
      if (baseImgFlag) {
        clearInterval(time)
        resolve(baseImg)
      }
    }, 50)
  })
}

/**
 * 获取一个唯一ID
 * */
let id = 0
export function uuid(): string {
  if (id++ > 1000000) {
    id = 0
  }
  return `${Date.now()}-${id}`
}

/**
 * fileToBase64
 * */
export function fileToBase64(file: File): Promise<string | undefined | ArrayBuffer | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    reader.onload = (e) => {
      resolve(e.target?.result)
    }
  })
}

/**
 * 获取对应文件的图标
 * */

export function getFileIcon(fileName: string): string {
  if (/\.(zip)$/gi.test(fileName)) {
    return ZIPImg
  }

  if (/\.(doc|docx)$/gi.test(fileName)) {
    return WORDImg
  }

  if (/\.(pptx,pptm,ppt,potx,potm,pot,ppsx,ppsm,ppsm,ppam,ppa,xml,pptx,odp)$/gi.test(fileName)) {
    return PPTImg
  }

  if (/\.(xls|xlsx|xlsm|xlt|xltx|xltm)$/gi.test(fileName)) {
    return EXCELImg
  }

  return OTHERImg
}

/**
 * 截取字符串
 * */
export function cutstr(str: string, len: number): string {
  let strLength = 0
  let strLen = 0
  let strCut = ''
  strLen = str.length
  for (let i = 0; i < strLen; i++) {
    const a = str.charAt(i)
    strLength++
    if (escape(a).length > 4) {
      // 中文字符的长度经编码之后大于4
      strLength++
    }
    strCut = strCut.concat(a)
    if (strLength >= len) {
      strCut = strCut.concat('...')
      return strCut
    }
  }
  // 如果给定字符串小于指定长度，则返回源字符串；
  if (strLength < len) {
    return str
  }
  return ''
}

export function bytesConver(num: number): string {
  if (!num) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(num) / Math.log(k))

  return `${(num / k ** i).toPrecision(3)} ${sizes[i]}`
}

export default {
  getMsgListByNode
}
