import { file } from './fileCache'
import { strCache } from './strCache'

export const cache = {
  ...strCache,
  file
}
