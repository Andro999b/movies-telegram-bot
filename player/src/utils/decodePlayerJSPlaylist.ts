export default (file: string, keys: string[], keyPrefix = '//_//'): string | null => {

  let a = file.substring(2)

  for (const key of keys) {
    a = a.replace(keyPrefix + window.btoa(key), '')
  }

  try {
    return window.atob(a)
  } catch (e) {
    return null
  }
}
