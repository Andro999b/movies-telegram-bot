const DirectMediaProvider = require('./Provider')
const urlencode = require('urlencode')
const superagent = require('superagent')
const convertPlayerJSPlaylist = require('../utils/convertPlayerJSPlaylist')
const { base64encode, base64decode } = require('../utils/base64')

class SeasonvarProvider extends DirectMediaProvider {
    constructor() {
        super('seasonvar', {
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
                        const $info = $el.find('.pgs-sinfo')
                        const serialId = $info.attr('data-id-serial')
                        const seasonId = $info.attr('data-id-season')

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

                        const files = await this._extractSeasonFiles(serialId, seasonId, secureMark)

                        return files.map((file, index) => ({
                            ...file,
                            id: index + 1
                        }))
                    }
                }
            }
        })
    }

    async search(query) {
        const { searchUrl, timeout } = this.config

        query = this._prepareQuery(query)

        const res = await superagent
            .get(`${searchUrl}?query=${encodeURIComponent(query)}`)
            .timeout(timeout)


        const body = JSON.parse(res.text)
        if (!body.suggestions || !body.suggestions.valu) return []

        const { suggestions: { valu }, data } = body

        return valu
            .filter((_, index) => data[index] && data[index].endsWith('html'))
            .map((name, index) => ({
                name: name.replace(/<[^>]*>/g, ''),
                id: urlencode(this.config.baseUrl + '/' + data[index]),
                provider: this.name
            }))
    }

    async _extractSeasonFiles(serialId, seasonId, secureMark) {
        try {
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

            let matches = res.text.match(/'0': "(.+)"/)
            const plist = matches[1]
            //TODO: Default translation
            // const translations = { 0: plist }

            // matches = res.text.match(/pl\[\d+\] = "[^"]+"/g)
            // if(matches.length > 0) {
            //     matches.forEach((match) => {
            //         const parts = match.split(' = ')
            //         const transId = parts[0].substring(3, parts[0].length - 1)
            //         const url = parts[1].substring(1, parts[1].length - 1)
            //         translations[transId] = url
            //     })
            // }

            // console.log(translations);
            const plistRes = await superagent
                .get(`${this.config.baseUrl}${plist}`)
                .timeout(this.config.timeout)

            const playlist = JSON.parse(plistRes.text)

            return convertPlayerJSPlaylist(playlist, (x) => this._decryptFilePath(x))
            // return translations
        } catch (e) {
            console.error('Seasonvar sesson extractor failed', e)
            return []
        }
    }

    _decryptFilePath(x) {
        const { encryptKey } = this.config

        let a = x.substr(2)

        a = a.replace('//' + base64encode(encryptKey), '')

        try {
            a = base64decode(a)
        } catch (e) {
            a = ''
        }

        return [{
            url: a,
            quality: 0
        }]
    }
}

module.exports = SeasonvarProvider