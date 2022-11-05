export const base64encode = (str: string): string => {
  const binary = encodeURIComponent(str)
    .replace(
      /%([0-9A-F]{2})/g,
      (_, p1) => String.fromCharCode(parseInt('0x' + p1.toString()))
    )

  return Buffer.from(binary, 'binary').toString('base64')
}

export const base64decode = (str: string): string => {
  const encodedUrl = Buffer.from(str, 'base64')
    .toString('binary')
    .split('')
    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
    .join('')

  return decodeURIComponent(encodedUrl)
}

export const base64UrlDecode = (str: string): string => {
  str = str
    .replace(/-/g, '+')
    .replace(/-/g, '/')

  const encodedUrl = Buffer.from(str, 'base64')
    .toString('binary')
    .split('')
    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
    .join('')

  return decodeURIComponent(encodedUrl)
}