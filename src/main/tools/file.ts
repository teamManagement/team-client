import { createHash } from 'crypto'
import fs from 'fs'

export function fileToSha512(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const h = createHash('sha512')
    let ok = false
    const fileReader = fs.createReadStream(filePath)
    fileReader.addListener('error', (err) => {
      ok = true
      reject(err)
    })
    fileReader.addListener('data', (buf) => {
      h.update(buf)
    })
    fileReader.addListener('end', () => {
      if (ok) {
        return
      }
      resolve(h.digest('hex'))
    })
  })
}
