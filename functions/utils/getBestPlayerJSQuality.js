module.exports = (input) => {
    return input
        .replace(/\\/g, '')
        .split(' or ')
        .reduce((acc, it) => acc.concat(it.split(',')), [])
        .map((link) => {
            const res = link.match(/(\[.+\])(?<url>.*[^\d](?<quality>\d+).mp4)/)
            return res && {
                url: res.groups.url,
                quality: parseInt(res.groups.quality)
            }
        })
        .filter((it) => it)
        .sort((a, b) => a.quality - b.quality)
        .map((it) => it.url)
        .filter((v, i, a) => a.indexOf(v) === i)
}