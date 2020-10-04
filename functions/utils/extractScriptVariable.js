function extractString(script, varName) {
    const parts = script.match(new RegExp(`${varName} = "([^"]+)"`))

    if (parts && parts.length > 1) {
        return parts[1]
    }

    return null
}

function extractStringPropery(script, varName) {
    const parts = script.match(new RegExp(`"${varName}":"([^"]+)"`))

    if (parts && parts.length > 1) {
        return parts[1]
    }

    return null
}

function extractJSStringPropery(script, varName) {
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

module.exports = {
    extractString,
    extractStringPropery,
    extractJSStringPropery,
    extractNumber,
    extractObject
}