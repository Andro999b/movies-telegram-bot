const superagent = require('superagent')

function getBestQuality(input) {
    return Object.keys(input)
        .map((key) => {
            return {
                url: input[key],
                quality: parseInt(key)
            }
        })
        .filter((it) => it)
        .sort((a, b) => a.quality - b.quality)
        .map((it) => it.url)
        .pop()
}

function convertPlaylist(playlist) {
    const { seasons } = playlist

    return seasons
        .sort((a, b) => a.season - b.season)
        .map(({ season, episodes }) => {
            
            return episodes.map(({ episode, id, hlsList }) => ({
                path: `Season ${season}`,
                name: `Episode ${episode}`,
                id,
                manifestUrl: getBestQuality(hlsList),
            }))
        })
        .reduce((acc, item) => acc.concat(item), [])
}

module.exports = async (url) => {
    let res
    try {
        res = await superagent.get(url.startsWith('//') ? 'https:' + url : url)
    } catch (e) {
        console.error('Fail get iframe', url, e)
        return []
    }

    let parts = res.text.match(/apiBaseUrl:\s+"(?<api>.+)"/)

    if(parts) {
        const { groups: { api } } = parts
        const { groups: { franchise } } = res.text.match(/franchise:\s+(?<franchise>\d+)/)
        const { groups: { referer } } = res.text.match(/referer:\s+"(?<referer>.+)"/)

        const seasonsRes = await superagent.get(api + `season/by-franchise/?id=${franchise}&host=${referer}`)
        const seasons = JSON.parse(seasonsRes.text)

        seasons.sort((a, b) => a.season - b.season)

        return (await Promise.all(seasons.map(async ({ id, season }) => {
            const seasonsRes = await superagent.get(api + `video/by-season/?id=${id}&host=${referer}`)
            const files = JSON.parse(seasonsRes.text)

            return files.map((file, index) => ({
                id: file.id,
                manifestUrl: getBestQuality(file.urlQuality),
                path: `Season ${season}`,
                name: `Episode ${index + 1}`,
            }))
        }))).reduce((acc, files) => acc.concat(files), [])
    }

    parts = res.text.match(/playlist: (?<playlist>.+),/)
    if(parts) {
        let playlist

        eval(`playlist = ${parts.groups.playlist}`)

        return convertPlaylist(playlist)
    }

    const { groups: { hls } } = res.text.match(/hlsList: (?<hls>{[^}]+}),/)

    return [{
        id: 1,
        manifestUrl: getBestQuality(JSON.parse(hls)),
    }]
}