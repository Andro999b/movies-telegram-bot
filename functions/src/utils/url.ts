export const lastPathPart = (url: string | undefined): string => {
  const parts = url?.split('/')

  if (parts) {
    return parts.reverse().find((it) => it) ?? ''
  }

  return ''
}

export const lastPathPartNoExt = (url: string | undefined): string => {
  return lastPathPart(url).split('.')[0]
}