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

            const res = await superagent
                .get(`${baseUrl}/${type}?direction=desc&field=global&limit=${pageSize}&ordering=${ordering}&query=${encodeURIComponent(query)}&api_token=${token}`)
                .timeout(timeout)

            return { res, type}
        })

        const results = await Promise.all(promices)
        
        return results
            .map(({ res, type }) => 
                JSON.parse(res.text).data.map((item) => ({...item, type}))
            )
            .reduce((acc, item) => acc.concat(item), [])
            .map(({ id, ru_title, kinopoisk_id, orig_title, type }) => ({
                provider: this.name, 
                id: `${type}_${id}`,
                name: `${ru_title} (${orig_title})`,
                image: `https://corsproxy.movies-player.workers.dev/?${encodeURIComponent(`https://st.kp.yandex.net/images/film_big/${kinopoisk_id}.jpg`)}`
            }))
    }

    async getInfo(typeAndId) {
        const [type, id] = typeAndId.split('_')

        const { baseUrl, token, timeout } = this.config

        const res = await superagent.get(`${baseUrl}/${type}?api_token=${token}&id=${id}`)
            .timeout(timeout)

        if(res.body.data.length == 0)
            return null

        const { ru_title, iframe_src, kinopoisk_id } = res.body.data[0]
        const url = iframe_src.startsWith('//') ? 'https:' + iframe_src: iframe_src

        const files = await videocdnembed(url)
        const kinopoiskPoster = `https://st.kp.yandex.net/images/film_big/${kinopoisk_id}.jpg`

        if(files.length == 1) {
            files[0].name = ru_title
        }

        return {
            provider: this.name, 
            title: ru_title,
            files,
            image: `https://corsproxy.movies-player.workers.dev/?${encodeURIComponent(kinopoiskPoster)}`
        }
    }
}

module.exports = VideoCDNProvider