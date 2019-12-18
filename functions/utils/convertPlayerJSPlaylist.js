const getBestPlayerJSQuality = require('./getBestPlayerJSQuality')

function extractFile(file, linksExtractor) {
    const urls = [].concat(linksExtractor(file))
    const mainUrl = urls.pop()
    if (mainUrl.endsWith('m3u8')) {
        return {
            manifestUrl: mainUrl
        }
    } else {
        
        const item = {
            url: mainUrl
        }

        if (urls.length > 0) {
            item.alternativeUrls = urls
        }

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
            const { title, comment, folder } = it
            const path = title || comment || `Season ${index + 1}`
 
            return convertFolder(
                prefix ? prefix + '/' + path : path, 
                folder, 
                linksExtractor
            )
        }
    })
        .reduce((acc, items) => acc.concat(items), [])
}

module.exports = function (playlist, linksExtractor = getBestPlayerJSQuality) {
    if(typeof playlist === 'string') {
        return extractFile(playlist, linksExtractor)
    } else {
        return convertFolder(null, playlist, linksExtractor)
    }
}