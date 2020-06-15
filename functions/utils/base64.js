module.exports = {
    base64encode: (str) => {
        const binary = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1))
        return Buffer.from(binary, 'binary').toString('base64')
    },
    base64decode: (str) => {
        const encodedUrl = Buffer.from(str, 'base64')
            .toString('binary')
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')

        return decodeURIComponent(encodedUrl)
    },
    base64UrlDecode: (str) => {
        str = str
            .replace(/\-/g, '+')
            .replace(/\-/g, '/')

        const encodedUrl = Buffer.from(str, 'base64')
            .toString('binary')
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')

        return decodeURIComponent(encodedUrl)
    }
}