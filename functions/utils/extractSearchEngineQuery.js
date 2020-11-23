const superagent = require('superagent')
const { extractStringPropery } = require('./extractScriptVariable')

const extractFromGoogleShorts = async (link) => {
    if (link.startsWith('https://g.co')) {
        const res = await superagent
            .get(link)
            .timeout(5000)
            .redirects(0)
            .ok((r) => r.status < 400)

        return res.header['location']
    }

    return null
}

const extractFromKinopoisk = async (link) => {
    if (link.startsWith('https://www.kinopoisk.ru')) {
        const res = await superagent
            .get(`https://corsproxy.movies-player.workers.dev/?${link}`)
            .timeout(5000)

        return extractStringPropery(res.text, 'name')
    }

    return null
}

const extractFromUrlParams = (link) => {
    const parts = link.match(/&(q|text)=([^&]+)/)

    if (parts && parts.length > 2) {
        const query = parts[2]

        return decodeURIComponent(query).replace(/\+/g, ' ')
    }

    return null
}

module.exports = async (link) => {
    let query = await extractFromGoogleShorts(link)
    if (query) return query

    query = await extractFromKinopoisk(link)
    if (query) return query


    return extractFromUrlParams(link)
}