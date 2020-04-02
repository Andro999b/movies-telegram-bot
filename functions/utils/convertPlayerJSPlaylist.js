const getBestPlayerJSQuality = require('./parsePlayerJSFile')

function extractFile(file, linksExtractor) {
    const qualityUrls = linksExtractor(file)
    
    const urls = qualityUrls.map((it) => it.url)
    const mainUrl = urls.shift()

    if (mainUrl.endsWith('m3u8')) {
        return { manifestUrl: mainUrl }
    } else {
        const item = { url: mainUrl }

        // if (qualityUrls.length > 0) {
        //     item.qualitiesUrls = qualityUrls
        // }

        return item
    }
}

function convertFolder(prefix, items, linksExtractor) {
    return items.map((it, index) => {
        if (it.file) {
            const item = extractFile(it.file, linksExtractor)
            item.name = `Episode ${index + 1}`

            if(prefix) {
                item.path = prefix
            }

            return [item]
        } else {
            const { title, comment, folder, playlist } = it
            const path = title || comment || `Season ${index + 1}`
 
            return convertFolder(
                prefix ? prefix + '/' + path : path, 
                folder || playlist, 
                linksExtractor
            )
        }
    })
        .reduce((acc, items) => acc.concat(items), [])
}

function decode0(input) {
    if (input.indexOf('.') == -1) {
        input = input.substr(1)
        let s2 = ''
        for (let i = 0; i < input.length; i += 3) {
            s2 += '%u0' + input.slice(i, i + 3)
        }
        input = unescape(s2)
    }
    return input
}

module.exports = function (playlist, linksExtractor = getBestPlayerJSQuality) {
    if(typeof playlist === 'string') {
        if (playlist.startsWith('#0')) {
            playlist = decode0(playlist)
        }
        if(playlist.startsWith('[{')) {
            return convertFolder(null, JSON.parse(playlist), linksExtractor)
        } else {
            return [extractFile(playlist, linksExtractor)]
        }
    } else {
        return convertFolder(null, playlist, linksExtractor)
    }
}