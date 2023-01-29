import { base64decode, base64encode } from './base64'

export default (file: string, keys: string[], keyPrefix = '//_//'): string | null => {

  let a = file.substring(2)

  for (const key of keys) {
    a = a.replace(keyPrefix + base64encode(key), '')
  }

  try {
    return base64decode(a)
  } catch (e) {
    return null
  }
}