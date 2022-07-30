const handlers = {}

const handleKeyUp = (e) => {
    const handler = handlers[e.code]

    if(handler) handler()

    e.stopPropagation()
    e.preventDefault()
}

window.addEventListener('keyup', handleKeyUp, true)

export function addGlobalKey(code, handler) {
    if(Array.isArray(code)) {
        code.forEach((c) => handlers[c] = handler)
    } else {
        handlers[code] = handler
    }
}

export function removeGlobalKey(code) {
    if(Array.isArray(code)) {
        code.forEach((c) => delete handlers[c])
    } else {
        delete handlers[code]
    }
}