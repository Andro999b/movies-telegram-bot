import Provider from './CFDataLifeProvider'
import urlencode from 'urlencode'
import superagent from 'superagent'
import videocdnembed from '../utils/videocdnembed'
import { extractStringProperty } from '../utils/extractScriptVariable'

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
                        
                        if(iframeSrc.includes('video.kinogo')) {
                            return this._extractV2(iframeSrc)
                        }

                        return this._extractV1(iframeSrc)
                    }
                },
                trailer: {
                    selector: 'video>source',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            }
        })
    }

    async _extractV2(iframeSrc) {
        return videocdnembed(iframeSrc)
    }

    async _extractV1(iframeSrc) {
        const { baseUrl, timeout } = this.config
        const { iframeHost, csrfToken, playlistPath } = await KinogoProvider
            .parseIframeV1(iframeSrc, baseUrl, timeout)

        if (playlistPath.startsWith('~')) {
            let fileUrl = KinogoProvider.getFileUrlV1(iframeHost, playlistPath)

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

    static async parseIframeV1(url, referer, timeout) {
        const iframeRes = await superagent.get(url)
            .set({ 'Referer': referer })
            .timeout(timeout)

        const iframeHost = new URL(url).host

        const playlistPath = extractStringProperty(iframeRes.text, 'file')
            .replace(/\\/g, '')

        const csrfToken = extractStringProperty(iframeRes.text, 'key')

        return { iframeHost, csrfToken, playlistPath }
    }

    static getFileUrlV1(iframeHost, filePath) {
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

export default KinogoProvider