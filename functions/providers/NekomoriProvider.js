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

        const filesByKey = {}
        const uids = new Set()

        const getAuthor = (author) => author ? author : 'Неизвестно'

        ret.body
            // eslint-disable-next-line no-prototype-builtins
            .filter(({ player }) => playersConfig.hasOwnProperty(player))
            .sort((a, b) => b.kind - a.kind)
            .forEach(({ author, kind, player, link, ep }) => {
                const name = `Episode ${ep}`
                const audio = `${kindTranslation[kind]} - ${getAuthor(author)} - ${player}`

                const uid = `${audio}/${name}`
                if (uids.has(uid)) return
                uids.add(uid)

                const file = { 
                    id: ep,
                    name, 
                    urls: [{ 
                        url: link,
                        audio,
                        extractor: { type: playersConfig[player].extractor }
                    }] 
                }

                if (filesByKey[name]) {
                    const currentFile = filesByKey[name]
                    const newUrls = currentFile.urls.concat(
                        file.urls.map((u) => ({...u, audio}))
                    )
                    filesByKey[name] = { ...currentFile, urls: newUrls }
                } else {
                    filesByKey[name] = file
                }
            })

        return {
            id: artId,
            title,
            provider: this.name,
            image: `${postersCDNUrl}/${artId}.jpg`,
            files: Object.values(filesByKey).sort((a, b) => a.id - b.id)
        }
    }
}

module.exports = NekomoriProvider