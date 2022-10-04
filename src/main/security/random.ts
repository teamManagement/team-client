import { random, util } from 'node-forge'
import crypto from 'crypto'

export function randomBytes2HexStr(count: number): string {
  const bytes = random.getBytesSync(count)
  return util.bytesToHex(bytes)
}

export function uniqueId(): string {
  return crypto.randomUUID({ disableEntropyCache: true })
}
