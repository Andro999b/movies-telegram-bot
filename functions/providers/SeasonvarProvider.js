const DirectMediaProvider = require('./Provider')
const urlencode = require('urlencode')
const $ = require('cheerio')
const superagent = require('superagent')
const convertPlayerJSPlaylist = require('../utils/convertPlayerJSPlaylist')
const parsePlayerJSFile = require('../utils/parsePlayerJSFile')

class SeasonvarProvider extends DirectMediaProvider {
    constructor() {
        super('seasonvar', {
            scope: '.pgs-search-wrap',
            selectors: {
                id: { selector: '.pgs-search-info a:first-child', transform: ($el) => urlencode($el.attr('href')) },
                name: '.pgs-search-info a:first-child',
                image: {
                    selector: '.pst img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '.middle',
            detailsSelectors: {
                title: '.pgs-sinfo-title',
                image: {
                    selector: '.poster img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    transform: async ($el) => {
                        // extract serial id
                        const serialId = $el.find('.pgs-sinfo').attr('data-id-serial')

                        // extract security mark
                        let matches
                        $el.find('script').each((_, elem) => {
                            const script = elem.children[0]

                            if (script) {
                                matches = script.data.match(/'secureMark': '([0-9a-z]+)'/)
                                if (matches) return false
                            }
                        })

                        if (!matches) return []
                        const secureMark = matches[1]

                        const seasons = $el.find('.pgs-seaslist li a')
                            .map((_, el) => $(el).attr('href'))
                            .toArray()
                            .map((url) =>
                                url.split('-')[1]
                            )

                        //seasons files
                        const files = (await Promise.all(seasons.map(async (seasonId) =>
                            await this._extractSeasonFiles(serialId, seasonId, secureMark)
                        )))
                            .map((files, index) => {
                                if (files.length && files[0].path)
                                    return files

                                return files.map((file) => (({
                                    ...file,
                                    path: `Season ${index + 1}`,
                                    name: `${file.name}`
                                })))
                            })
                            .reduce((acc, files) => acc.concat(files), [])
                            .map((file, index) => ({
                                ...file,
                                id: index + 1
                            }))

                        return files
                    }
                }
            }
        })
    }

    async _extractSeasonFiles(serialId, seasonId, secureMark) {
        try{
            const res = await superagent
                .post(`${this.config.baseUrl}/player.php`)
                .set('X-Requested-With', 'XMLHttpRequest')
                .type('form')
                .timeout(this.config.timeout)
                .send({
                    id: seasonId,
                    serial: serialId,
                    secure: secureMark,
                    time: Date.now(),
                    type: 'html5'
                })

            const matches = res.text.match(/'0': "(.+)"/)
            const plist = matches[1]

            const plistRes = await superagent
                .get(`https://corsproxy.movies-player.workers.dev/?${this.config.baseUrl}${plist}`)
                .timeout(this.config.timeout)

            const playlist = JSON.parse(plistRes.text)

            return convertPlayerJSPlaylist(playlist, (x) => this._decryptFilePath(x))
        } catch(e) {
            console.error(e)
            return []
        }
    }

    _decryptFilePath(x) {
        const { encryptKey } = this.config

        let a = x.substr(2)

        function b1(str) {
            const binary = encodeURIComponent(str)
                .replace(/%([0-9A-F]{2})/g, (_, p1)  => String.fromCharCode('0x' + p1))

            return Buffer.from(binary, 'binary').toString('base64')
        }

        function b2(str) {
            const encodedUrl = Buffer.from(str, 'base64')
                .toString('binary')
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')

            return decodeURIComponent(encodedUrl)
        }

        a = a.replace('//' + b1(encryptKey), '')

        try {
            a = b2(a)
        } catch (e) {
            a = ''
        }

        return parsePlayerJSFile(a)
    }

    getSearchUrl(q) {
        const { searchUrl } = this.config
        return `${searchUrl}?q=${encodeURIComponent(q)}`
    }
}

module.exports = SeasonvarProvider