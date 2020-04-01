module.exports = (input) => {
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
        .filter((it) => it)
        .sort((a, b) => a.quality - b.quality)

    return urls
}