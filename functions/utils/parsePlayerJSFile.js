const { HttpResponse } = require("aws-sdk")

module.exports = (input) => {
    const seen = new Set()
    const urls = input
        .replace(/\\/g, '')
        .split(',')
        .map((link) => {
            const res = link.match(/\[[^0-9\[]*(?<quality>[0-9]+)[^0-9\]]*\]?(?<urls>.*)/)

            if(!res) return null

            let { urls, quality } = res.groups
            quality = quality ? parseInt(quality) : 0

            console.log(urls, quality);

            return urls.split(' or ').map((url) => ({ url, quality }))
        })
        .reduce((acc, it) => acc.concat(it), [])
        .map(({ url, quality }) => {
            if(!quality) {
                const res = url.match(/.*\/(?<quality>[0-9]+)\.(?:mp4|m3u8)/)
                quality = res && res.groups.quality ? parseInt(res.groups.quality) : quality
            }
           
            return {
                url: url.startsWith('//') ? 'https:' + url : url,
                quality
            }
        })
        .filter((it) => it)
        .filter((it) => {
            if(seen.has(it.url)) return false
            seen.add(it.url)
            return true
        })
        .sort((a, b) => b.quality - a.quality)

    return urls
}