const getBestPlayerJSQuality = require('./getBestPlayerJSQuality')

module.exports = function(playlist) {
    return playlist.map((it, season) => {
        if (it.file) {
            const urls = getBestPlayerJSQuality(it.file)
            return [{
                name: `Episode ${season + 1}`,
                url: urls.pop(),
                alternativeUrls: urls
            }]
        } else {
            const { title, folder } = it
            const path = title ? title.trim() : `Season ${season + 1}`
            return folder.map(({ file }, episode) => {
                const urls = getBestPlayerJSQuality(file)
                return {
                    path,
                    name: `${path} / Episode ${episode + 1}`,
                    url: urls.pop(),
                    alternativeUrls: urls
                }
            })
        }
    })
        .reduce((acc, items) => acc.concat(items), [])
}