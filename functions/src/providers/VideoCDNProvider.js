const Provider = require('./Provider')
const superagent = require('superagent')
const videocdnembed = require('../utils/videocdnembed')

class VideoCDNProvider extends Provider {
    constructor() {
        super('videocdn')
    }

    async search(query) {
        const { baseUrl, token, types, timeout, pageSize } = this.config

        query = this._prepareQuery(query)

        const promices = types.map(async (type) => {
            const ordering = type.endsWith('series') ? 'last_episode_accepted' : 'last_media_accepted'

            try {
                const res = await superagent
                    .get(`${baseUrl}/${type}?direction=desc&field=global&limit=${pageSize}&ordering=${ordering}&query=${encodeURIComponent(query)}&api_token=${token}`)
                    .timeout(timeout)

                return { items: JSON.parse(res.text).data, type }
            } catch (e) {
                console.error(`videocdn api fail for type ${type}`, e)
            }
            return { items: [], type }
        })

        const results = await Promise.all(promices)

        return results
            .map(({ items, type }) => items.map((item) => ({ ...item, type })))
            .reduce((acc, item) => acc.concat(item), [])
            .map(({ id, ru_title, kinopoisk_id, orig_title, type, year }) => {
                year = year ? year.split('-')[0] : ''
                return {
                    provider: this.name,
                    id: `${type}_${id}`,
                    name: `${ru_title} (${year || orig_title})`,
                    image: `https://corsproxy.movies-player.workers.dev/?${encodeURIComponent(`https://st.kp.yandex.net/images/film_big/${kinopoisk_id}.jpg`)}`
                }
            })
    }

    async getInfo(typeAndId) {
        const [type, id] = typeAndId.split('_')

        const { baseUrl, token, infoTimeout } = this.config

        const res = await superagent.get(`${baseUrl}/${type}?api_token=${token}&id=${id}`)
            .timeout(infoTimeout)

        if (res.body.data.length == 0)
            return null

        const { ru_title, iframe_src, kinopoisk_id } = res.body.data[0]
        const url = iframe_src.startsWith('//') ? 'https:' + iframe_src : iframe_src

        let files = []
        try {
            files = (await videocdnembed(url.replace('5167.videocdn.pw', 'videocdn.so'), infoTimeout))
                .map((file, id) => ({ id, ...file }))
        } catch (e) {
            console.error('Failt to get files', e)
        }

        const kinopoiskPoster = `https://st.kp.yandex.net/images/film_big/${kinopoisk_id}.jpg`


        if (files.length == 1) {
            files[0].name = ru_title
        }

        return {
            id: typeAndId,
            provider: this.name,
            title: ru_title,
            files,
            image: `https://corsproxy.movies-player.workers.dev/?${encodeURIComponent(kinopoiskPoster)}`
        }
    }
}

module.exports = VideoCDNProvider