module.exports = (input) => {
    const seen = new Set()
    const urls = input
        .replace(/\\/g, '')
        .split(',')
        .map((link) => {
            const res = link.match(/(\[(?<quality>[0-9]+)p?\])?(?<urls>.*)/)

            if(!res) return null

            let { urls, quality } = res.groups
            quality = quality ? parseInt(quality) : 0

            return urls.split(' or ').map((url) => ({ url, quality }))
        })
        .reduce((acc, it) => acc.concat(it), [])
        .map(({ url, quality }) => {
            const res = url.match(/.*\/(?<quality>[0-9]+)\.(?:mp4|m3u8)/)

            return {
                url,
                quality: res && res.groups.quality ? parseInt(res.groups.quality) : quality
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