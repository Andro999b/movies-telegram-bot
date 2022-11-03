export const base64UrlEncode = (str: string): string => {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return window.btoa(
    encodeURIComponent(str)
      .replace(
        /%([0-9A-F]{2})/g,
        (_, p1) => String.fromCharCode(parseInt('0x' + p1)))
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary_string = window.atob(base64)
  const len = binary_string.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes.buffer
}