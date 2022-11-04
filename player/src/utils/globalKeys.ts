type Handler = () => void

const handlers: Record<string, Handler> = {}

const handleKeyUp = (e: KeyboardEvent): void => {
  const handler = handlers[e.code]

  if (handler) handler()

  e.stopPropagation()
  e.preventDefault()
}

window.addEventListener('keyup', handleKeyUp, true)

export const addGlobalKey = (code: string[] | string, handler: Handler): void => {
  if (Array.isArray(code)) {
    code.forEach((c) => handlers[c] = handler)
  } else {
    handlers[code] = handler
  }
}

export const removeGlobalKey = (code: string[]): void => {
  if (Array.isArray(code)) {
    code.forEach((c) => delete handlers[c])
  } else {
    delete handlers[code]
  }
}