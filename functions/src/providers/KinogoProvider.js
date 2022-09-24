const Provider = require('./CFDataLifeProvider')
const urlencode = require('urlencode')
const superagent = require('superagent')

const { extractStringProperty } = require('../utils/extractScriptVariable')

class KinogoProvider extends Provider {
    constructor() {
        super('kinogo', {
            scope: 'div.shortstory',
            selectors: {
                id: {
                    selector: '.zagolovki>a:nth-last-child(1)',
                    transform: ($el) => urlencode($el.attr('href'))
                },
                name: '.zagolovki>a:nth-last-child(1)',
                image: {
                    selector: '.shortimg>div>a>img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.shortstorytitle>h1',
                image: {
                    selector: '.fullimg>div>a>img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: '.box.visible iframe',
                    transform: async ($el) => {
                        const iframeSrc = $el.attr('src')
                        const { baseUrl, timeout } = this.config
                        const { iframeHost, csrfToken, playlistPath } = await KinogoProvider
                            .parseIframe(iframeSrc, baseUrl, timeout)

                        if (playlistPath.startsWith('~')) {
                            let fileUrl = KinogoProvider.getFileUrl(iframeHost, playlistPath)

                            const fileRes = await superagent.post(fileUrl)
                                .set({
                                    'Referer': `https://${iframeHost}`,
                                    'X-CSRF-TOKEN': csrfToken
                                })
                                .buffer()
                                .timeout(timeout)

                            fileUrl = fileRes.text

                            return [{
                                id: 0,
                                urls: [{ url: fileUrl, hls: true }]
                            }]
                        } else {
                            const playlistUrl = `https://${iframeHost}${playlistPath}`

                            const playlistRes = await superagent.post(playlistUrl)
                                .set({
                                    'Referer': `https://${iframeHost}`,
                                    'X-CSRF-TOKEN': csrfToken
                                })
                                .timeout(timeout)

                            const rootFiles = playlistRes.body
                            if (rootFiles.length == 1) {
                                return rootFiles[0].folder
                                    .map(({ title, folder }, fileIndex) => ({
                                        id: fileIndex,
                                        name: title,
                                        urls: this._getUrls(folder, iframeSrc, 0, fileIndex)
                                    }))
                            } else {
                                let id = 0
                                return rootFiles.flatMap(({ title, folder }, seasonIndex) => {
                                    const season = title
                                    return folder
                                        .map(({ title, folder }, fileIndex) => ({
                                            id: id++,
                                            path: season,
                                            name: title,
                                            urls: this._getUrls(folder, iframeSrc, seasonIndex, fileIndex)
                                        }))
                                })
                            }
                        }
                    }
                },
                trailer: {
                    selector: 'video>source',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            }
        })
    }

    static async parseIframe(url, referer, timeout) {
        const iframeRes = await superagent.get(url)
            .set({ 'Referer': referer })
            .timeout(timeout)

        const iframeHost = new URL(url).host

        const playlistPath = extractStringProperty(iframeRes.text, 'file')
            .replace(/\\/g, '')

        const csrfToken = extractStringProperty(iframeRes.text, 'key')

        return { iframeHost, csrfToken, playlistPath }
    }

    static getFileUrl(iframeHost, filePath) {
        return `https://${iframeHost}/playlist/${filePath.substring(1)}.txt`
    }

    _getUrls(folder, iframeSrc, seasonIndex, fileIndex) {
        return folder
            .filter(({ file }) => file)
            .map(({ title }, urlIndex) => ({
                audio: title,
                url: iframeSrc,
                hls: true,
                extractor: {
                    type: 'kinogo',
                    params: {
                        file: `${seasonIndex},${fileIndex},${urlIndex}`
                    }
                }
            }))
    }

    _getSiteEncoding() {
        return 'windows-1251'
    }
}

module.exports = KinogoProvider