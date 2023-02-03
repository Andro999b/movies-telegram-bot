import JSON5 from 'json5'

export const extractString = (script: string, varName: string): string | null => {
  const parts = script.match(new RegExp(`${varName} = "([^"]+)"`))

  if (parts && parts.length > 1) {
    return parts[1]
  }

  return null
}

export const extractStringSingleQuote = (script: string, varName: string): string | null => {
  const parts = script.match(new RegExp(`${varName} = '([^']+)'`))

  if (parts && parts.length > 1) {
    return parts[1]
  }

  return null
}

export const extractStringProperty = (script: string, varName: string): string | null => {
  const parts = script.match(new RegExp(`"${varName}":\\s*"([^"]+)"`))

  if (parts && parts.length > 1) {
    return parts[1]
  }

  return null
}

export const extractStringSingleQuoteProperty = (script: string, varName: string): string | null => {
  const parts = script.match(new RegExp(`'${varName}':\\s*'([^']+)'`))

  if (parts && parts.length > 1) {
    return parts[1]
  }

  return null
}

export const extractArrayProperty = (script: string, varName: string): string | null => {
  const parts = script.match(new RegExp(`${varName}:(.*)`))

  if (parts && parts.length > 1) {
    return JSON5.parse(parts[1])
  }

  return null
}

export const extractJSStringProperty = (script: string, varName: string): string | null => {
  const parts = script.match(new RegExp(`${varName}:\\s*"([^"]+)"`))

  if (parts && parts.length > 1) {
    return parts[1]
  }

  return null
}

export const extractObject = (script: string, varName: string): Record<string, unknown> | null => {
  const parts = script.match(new RegExp(`${varName} = ({[^}]+})`))

  if (parts && parts.length > 1) {
    return JSON.parse(parts[1].replace(',}', '}'))
  }

  return null
}

export const extractNumber = (script: string, varName: string): string | null => {
  const parts = script.match(new RegExp(`${varName} = ([0-9]+)`))

  if (parts && parts.length > 1) {
    return parts[1]
  }

  return null
}