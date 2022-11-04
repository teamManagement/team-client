import crypto from 'crypto'

interface IdInterface {
  seq(): number
  uuid(): string
}

let _seq = 0

function seq(): number {
  _seq += 1
  return _seq
}

function uuid(): string {
  return crypto.randomUUID({ disableEntropyCache: true })
}

export const id = {
  seq,
  uuid
} as IdInterface
