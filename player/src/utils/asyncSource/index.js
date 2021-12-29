import parsePlayerJSFile from '../parsePlayerJSFile'

function getRezkaSourceTranslation({ dataId, translatorId, season, episode }) {
    let formData

    if(season) {
        formData = new FormData()
        formData.append('id', dataId)
        formData.append('translator_id', translatorId)
        formData.append('season', season)
        formData.append('episode', episode)
        formData.append('action', 'get_stream')
    } else {
        formData = new FormData()
        formData.append('id', dataId)
        formData.append('translator_id', translatorId)
        formData.append('action', 'get_movie')
    }

    return fetch(`https://corsproxy.movies-player.workers.dev/?https://rezka.ag/ajax/get_cdn_series/?t=${Date.now()}`, {
        method: 'POST',
        body: formData
    })
        .then((res) => res.json())
        .then((json) => ({
            urls: parsePlayerJSFile(json.url)
        })
        )
}

function getRezkaSource(source) {
    const { translatorId } = source
    if(typeof translatorId === 'object') {
        const names = Object.values(translatorId)
        const promisies = Object
            .keys(translatorId)
            .map((tid) => 
                getRezkaSourceTranslation({...source, translatorId: tid})
                    .catch(() => ({ urls: []}))
            )

        return Promise.all(promisies)
            .then((answers) => {
                const urls = answers
                    .flatMap(({ urls }, idx) => {
                        urls.forEach((url) => url.audio = names[idx])
                        return urls
                    })


                return { urls }
            })
    } else {
        return getRezkaSourceTranslation(source)
    }
}

export default {
    rezka: getRezkaSource
}