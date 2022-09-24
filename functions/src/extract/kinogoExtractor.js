const superagent = require('superagent')
const makeResponse = require('../utils/makeResponse')
const kinogoConfig = require('../providersConfig').kinogo
const KinogoProvider = require('../providers/KinogoProvider')

module.exports = async ({ url, file }) => {
    const timeout = 1000
    const { iframeHost, csrfToken, playlistPath } = await KinogoProvider
        .parseIframe(url, kinogoConfig.baseUrl, timeout)

    const playlistUrl = `https://${iframeHost}${playlistPath}`

    const playlistRes = await superagent.post(playlistUrl)
        .set({
            'Referer': `https://${iframeHost}`,
            'X-CSRF-TOKEN': csrfToken
        })
        .timeout(timeout)

    const rootFiles = playlistRes.body
    const [seasonIndex, fileIndex, urlIndex] = file.split(',')
    const filePath = rootFiles[+seasonIndex].folder[+fileIndex].folder[+urlIndex].file
    const fileUrl = KinogoProvider.getFileUrl(iframeHost, filePath)

    const fileRes = await superagent.post(fileUrl)
        .set({
            'Referer': `https://${iframeHost}`,
            'X-CSRF-TOKEN': csrfToken
        })
        .buffer()
        .timeout(timeout)

    return makeResponse(null, 302, {
        Location: fileRes.text
    })
}