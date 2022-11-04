import getBestPlayerJSQuality from './parsePlayerJSFile'

export default function (playlist, linksExtractor = getBestPlayerJSQuality) {
    const idsCache = {}

    function extractFile(file, linksExtractor) {
        return { urls: linksExtractor(file) }
    }
    
    function convertFolder(prefix, items, linksExtractor) {
        let counter = 0

        return items.map((it, index) => {
            if (it.file) {    
                const item = extractFile(it.file, linksExtractor)

                if(it.id) {
                    let cacheItem = idsCache[it.id]
                    if(cacheItem) {    
                        if(it.manifestUrl) cacheItem.manifestUrl = cacheItem.manifestUrl || it.manifestUrl
                        if(it.urls) cacheItem.urls = it.urls.concat(cacheItem.ursl || [])
    
                        return [cacheItem]
                    } else {
                        idsCache[it.id] = item
                    }
                }

                item.name = it.title || `Episode ${++counter}`
    
                if(prefix) {
                    item.path = prefix
                }
    
   
    
                return [item]
            } else {
                const { title, comment, folder, playlist } = it
                const path = title || comment || `Season ${index + 1}`
     
                return convertFolder(
                    prefix ? prefix + '/' + path.trim() : path.trim(), 
                    folder || playlist, 
                    linksExtractor
                )
            }
        })
            .reduce((acc, items) => acc.concat(items), [])
    }
    
    function decode0(input) {
        if (input.indexOf('.') == -1) {
            input = input.substring(1)
            let s2 = ''
            for (let i = 0; i < input.length; i += 3) {
                s2 += '%u0' + input.slice(i, i + 3)
            }
            input = unescape(s2)
        }
        return input
    }
    

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