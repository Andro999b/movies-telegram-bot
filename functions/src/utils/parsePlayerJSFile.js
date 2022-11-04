export default (input) => {
    const seen = new Set()
    const urls = input
        .replace(/\\/g, '')
        .split(',')
        .map((link) => {
            const res = link.trim().match(/(\[[^0-9[]*(?<quality>[0-9]+)[^0-9\]]*\])?(?<urls>.*)/)

            if(!res) return null

            let { urls, quality } = res.groups
            quality = quality ? parseInt(quality) : 0

            return urls.split(' or ').map((url) => ({ url, quality }))
        })
        .filter((it) => it)
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
        .map(({ url, quality}) => {
            return url
                .split(';')
                .map((translationLink) => {
                    const res = translationLink.match(/\{(?<audio>[^}]*)\}(?<url>.*)/)
                    if(!res) return { 
                        url: translationLink, 
                        quality
                    }

                    return { 
                        url: res.groups.url, 
                        audio: res.groups.audio, 
                        quality
                    }
                })
        })
        .reduce((acc, it) => acc.concat(it), [])
        .filter((it) => {
            if(seen.has(it.url)) return false
            seen.add(it.url)
            return true
        })
        .sort((a, b) => b.quality - a.quality)

    return urls
}