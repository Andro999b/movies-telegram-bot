const getBestPlayerJSQuality = require('./getBestPlayerJSQuality')

module.exports = function(playlist, linksExtractor = getBestPlayerJSQuality) {
    return playlist.map((it, season) => {
        if (it.file) {
            const urls = [].concat(linksExtractor(it.file))
            const item = {
                name: `Episode ${season + 1}`,
                url: urls.pop()
            }

            if(urls.length > 0) {
                item.alternativeUrls = urls
            }

            return [item]
        } else {
            const { title, comment, folder } = it
            const path = title || comment || `Season ${season + 1}`
            return folder.map(({ file }, episode) => {
                const urls = [].concat(linksExtractor(file))

                const item = {
                    path,
                    name: `${path} / Episode ${episode + 1}`,
                    url: urls.pop()
                }
    
                if(urls.length > 0) {
                    item.alternativeUrls = urls
                }

                return item
            })
        }
    })
        .reduce((acc, items) => acc.concat(items), [])
}