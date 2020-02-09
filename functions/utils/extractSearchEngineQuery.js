const superagent = require('superagent')

module.exports = async (link) => {
    if(link.startsWith('https://g.co')) {
        const res = await superagent
            .get(link)
            .redirects(0)
            .ok((r) => r.status < 400)

        link = res.header['location']
    }

    const parts = link.match(/&(q|text)=([^&]+)/)

    if(parts && parts.length > 2) {
        const query = parts[2]

        return decodeURIComponent(query).replace(/\+/g, ' ')
    }

    return null
}