module.exports = (input) => {
    const urls = input
        .replace(/\\/g, '')
        .split(' or ')
        .reduce((acc, it) => acc.concat(it.split(',')), [])

    if (urls.length == 1) return urls

    return urls
        .map((link) => {
            const res = link.match(/(\[(?<quality>[0-9]+)p?\])?(?<url>.*(?:mp4|m3u8))/)

            return res && {
                url: res.groups.url,
                quality: res.groups.quality ? parseInt(res.groups.quality) : 0
            }
        })
        .filter((it) => it)
        .sort((a, b) => a.quality - b.quality)
        .map((it) => it.url)
        .filter((v, i, a) => a.indexOf(v) === i)
}