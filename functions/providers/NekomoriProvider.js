const Provider = require('./Provider')
const superagent = require('superagent')

class NekomoriProvider extends Provider {
    constructor() {
        super('nekomori')
    }

    async search(query) {
        const { baseUrl, postersCDNUrl, timeout } = this.config

        query = this._prepareQuery(query)

        const ret = await superagent
            .get(`${baseUrl}/art?search=${encodeURIComponent(query)}`)
            .timeout(timeout)

        return ret.body.map(({ id, name }) => ({
            provider: this.name,
            id,
            name: name.ru,
            image: `${postersCDNUrl}/${id}.jpg`
        }))
    }

    async getInfo(artId) {
        const { baseUrl, timeout, postersCDNUrl, playersConfig } = this.config

        let ret = await superagent
            .get(`${baseUrl}/art/${artId}`)
            .timeout(timeout)

        const title = ret.body.name.ru

        ret = await superagent
            .get(`${baseUrl}/players?artId=${artId}`)
            .timeout(timeout)

        const kindTranslation = {
            3: 'Озвучка',
            2: 'Субтитры',
            1: 'Оригинал',
        }

        const files = []
        const uids = new Set()

        ret.body
            // eslint-disable-next-line no-prototype-builtins
            .filter(({ player }) => playersConfig.hasOwnProperty(player) )
            .sort((a, b) => a.ep - b.ep)
            .forEach(({ id, author, kind, player, link, ep }) => {
                const name = `Episode ${ep}`
                const path = `${kindTranslation[kind]}/${author ? author : 'Неизвестно'}/${player}`
                const uid = `${path}/${name}`

                if(!uids.has(uid)) {
                    uids.add(uid)
                    files.push({
                        id,
                        extractor: { type: playersConfig[player].extractor },
                        [playersConfig[player].hls ? 'manifestUrl' : 'url'] : link,
                        name,
                        path
                    })
                }
            })

        return {
            title,
            image: `${postersCDNUrl}/${artId}.jpg`,
            files
        }
    }
}

module.exports = NekomoriProvider