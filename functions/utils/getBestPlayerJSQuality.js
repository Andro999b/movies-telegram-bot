function getBestQuality(input) {
    const urls = input
        .replace(/\\/g, '')
        .split(' or ')
        .reduce((acc, it) => acc.concat(it.split(',')), [])

    if (urls.length == 1) return urls

    return urls
        .map((link) => {
            const res = link.match(/(\[.+\])(?<url>.*[^\d](?<quality>\d+).(?:mp4|m3u8))/)
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

function decode0(input) {
    if (input.indexOf('.') == -1) {
        input= input.substr(1)
        let s2 = ''
        for (let i = 0; i < input.length; i += 3) {
            s2 += '%u0' + input.slice(i, i + 3)
        }
        input = unescape(s2)
    }
    return input
}

module.exports = (input) => {
    if (input.startsWith('#0')) {
        return getBestQuality(decode0(input))
    }

    return getBestQuality(input)
}