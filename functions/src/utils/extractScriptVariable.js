import JSON5 from 'json5'

function extractString(script, varName) {
    const parts = script.match(new RegExp(`${varName} = "([^"]+)"`))

    if (parts && parts.length > 1) {
        return parts[1]
    }

    return null
}

function extractStringSingleQuote(script, varName) {
    const parts = script.match(new RegExp(`${varName} = '([^']+)'`))

    if (parts && parts.length > 1) {
        return parts[1]
    }

    return null
}

function extractStringProperty(script, varName) {
    const parts = script.match(new RegExp(`"${varName}":"([^"]+)"`))

    if (parts && parts.length > 1) {
        return parts[1]
    }

    return null
}

function extractArrayProperty(script, varName) {
    const parts = script.match(new RegExp(`${varName}:(.*)`))

    if (parts && parts.length > 1) {
        return JSON5.parse(parts[1]) 
    }

    return null
}

function extractJSStringProperty(script, varName) {
    const parts = script.match(new RegExp(`${varName}:\\s+"([^"]+)"`))

    if (parts && parts.length > 1) {
        return parts[1]
    }

    return null
}

function extractObject(script, varName) {
    const parts = script.match(new RegExp(`${varName} = ({[^}]+})`))

    if (parts && parts.length > 1) {
        return JSON.parse(parts[1].replace(',}', '}'))
    }

    return null
}

function extractNumber(script, varName) {
    const parts = script.match(new RegExp(`${varName} = ([0-9]+)`))

    if (parts && parts.length > 1) {
        return parts[1]
    }

    return null
}

export default {
    extractString,
    extractStringSingleQuote,
    extractStringProperty,
    extractArrayProperty,
    extractJSStringProperty,
    extractNumber,
    extractObject
}