const Provider = require('./DataLifeProvider')
const urlencode = require('urlencode')

const playesRegExp = /RalodePlayer\.init\((.*),(\[\[.*\]\]),/
const srcRegExp = /src="([^"]+)"/

const extractors = {
    // 'ashdi': {
    //     type: 'ashdi',
    //     hls: true
    // },
    'sibnet': {
        type: 'sibnetmp4',
        hls: false
    },
    'secvideo1': {
        type: 'mp4local'
    },
    'csst.online': {
        type: 'mp4local'
    },
    'veoh.com': null
}

class AnitubeUAProvider extends Provider {
    constructor() {
        super('anitubeua', {
            scope: '.story',
            selectors: {
                id: {
                    selector: '.story_c > h2 > a',
                    transform: ($el) => urlencode($el.attr('href'))
                },
                name: '.story_c > h2 > a',
                image: {
                    selector: '.story_post > img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '.story',
            detailsSelectors: {
                title: '.story_c h2',
                image: {
                    selector: '.story_post img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: '#VideoConstructor_v3_x_Player',
                    transform: ($el) => {
                        const script = $el.prev('script').get()[0].children[0].data
                        const matches = script.match(playesRegExp)

                        if (!matches || matches.length < 1)
                            return []

                        const audios = JSON.parse(matches[1])
                        const videos = JSON.parse(matches[2])

                        const files = []
                        const addFile = (index, audio, url, extractor) => {
                            const file = files[index] || {
                                id: index,
                                name: `Episode ${index + 1}`,
                                urls: []
                            }

                            files[index] = file
                            const fileUrl = {
                                url,
                                audio
                            }

                            if (extractor) {
                                fileUrl.extractor = { type: extractor.type }
                                if (extractor.hls) {
                                    fileUrl.hls = true
                                }
                            }
                            file.urls.push(fileUrl)
                        }

                        videos.forEach((episodes, i) => {
                            const audio = audios[i]

                            let id = 0
                            for (const episode of episodes) {
                                const { code } = episode

                                const srcMatch = code.match(srcRegExp)

                                if (!srcMatch || srcMatch.length < 1)
                                    return

                                const url = srcMatch[1]
                                const extractorName = Object.keys(extractors).find((extr) => url.indexOf(extr) != -1)

                                if (!extractorName)
                                    return

                                addFile(id, audio, url, extractors[extractorName])

                                id++
                            }
                        })

                        return files
                    }
                }
            }
        })
    }
}

module.exports = AnitubeUAProvider