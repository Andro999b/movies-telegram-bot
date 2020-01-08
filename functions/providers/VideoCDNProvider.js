const Provider = require('./Provider')
const superagent = require('superagent')
const videocdnembed = require('../utils/videocdnembed')

class VideoCDNProvider extends Provider {
    constructor() {
        super('videocdn')
    }

    async search(query) {
        const { baseUrl, token, types, timeout } = this.config

        const promices = types.map((type) => 
            superagent
                .get(`${baseUrl}/${type}?direction=desc&field=global&limit=10&ordering=last_episode_accepted&page=1&query=${encodeURIComponent(query)}&api_token=${token}`)
                .timeout(timeout)
        )

        const results = await Promise.all(promices)
        
        return results
            .map((res) => JSON.parse(res.text).data)
            .reduce((acc, item) => acc.concat(item), [])
            .map(({ id, ru_title}) => ({
                id,
                name: ru_title
            }))
    }

    async getInfo(id) {
        const { baseUrl, token, types, timeout } = this.config

        const res = await superagent.get(`${baseUrl}/short?api_token=${token}&id=${id}`)

        if(res.body.data.length == 0)
            return null

        const { title, iframe_src, kp_id } = res.body.data[0]
        const url = iframe_src.startsWith('//') ? 'https:' + iframe_src: iframe_src

        const files = await videocdnembed(url)
        

        return {
            title,
            files,
            image: `https://st.kp.yandex.net/images/film_big/${kp_id}.jpg`
        }
    }
}

module.exports = VideoCDNProvider