const Provider = require('./DataLifeProvider')
const urlencode = require('urlencode')
const superagent = require('superagent')
const $ = require('cheerio').default

const playesRegExp = /RalodePlayer\.init\((.*),(\[\[.*\]\]),/
const srcRegExp = /src="([^"]+)"/

const extractors = {
    'ashdi': {
        type: 'ashdi',
        hls: true
    },
    'sibnet': {
        type: 'sibnetmp4'
    },
    'secvideo1': {
        type: 'mp4local'
    },
    'csst.online': {
        type: 'mp4local'
    },
    'veoh.com': null,
    'tortuga.wtf': {
        type: 'tortuga',
        hls: true
    }
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
                    selector: ['#VideoConstructor_v3_x_Player', '.playlists-ajax'],
                    transform: async ($el) => {
                        if($el.attr('id') == 'VideoConstructor_v3_x_Player') {
                            return this.filesFromVideoContructor($el)
                        } else {
                            return this.filesFromPlaylistAjax($el)
                        }
                    }
                },
                trailer: {
                    selector: 'a.rollover',
                    transform: ($el) => {
                        let url = $el.attr('href')

                        url = url.replace('youtube.com/watch?v=', 'youtube.com/embed/')

                        return url
                    }
                }
            }
        })
    }

    async filesFromPlaylistAjax($el) {
        // https://anitube.in.ua/1866-legenda-pro-korru-2.html

        const newsId = $el.attr('data-news_id')
        const res = await superagent
            .get(`${this.config.baseUrl}/engine/ajax/playlists.php?news_id=${newsId}&xfield=playlist`)
            .set(this.config.headers)
            .timeout(5000)
            .disableTLSCerts()

        const files = []

        const $playlist = $(res.body.response)
        $playlist.find('.playlists-videos .playlists-items li')
            .toArray()
            .forEach((el) =>  {
                const $el = $(el)
                const [id] = $el.attr('data-id').split('_')
                const url = $el.attr('data-file')

                const extractorName = Object.keys(extractors).find((extr) => url.indexOf(extr) != -1)

                if (!extractorName)
                    return

                this.addFile(files, parseInt(id), null, url, extractors[extractorName])
            })

        return files
    }

    filesFromVideoContructor($el) {
        const script = $el.prev('script').get()[0].children[0].data
        const matches = script.match(playesRegExp)

        if (!matches || matches.length < 1)
            return []

        const audios = JSON.parse(matches[1])
        const videos = JSON.parse(matches[2])

        const files = []
        
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

                this.addFile(files, id, audio, url, extractors[extractorName])

                id++
            }
        })

        return files
    }

    addFile(files, index, audio, url, extractor) {
        const file = files[index] || {
            id: index,
            name: `Episode ${index + 1}`,
            urls: []
        }

        files[index] = file
        const fileUrl = { url }
        if(audio) fileUrl.audio = audio

        if (extractor) {
            fileUrl.extractor = { type: extractor.type }
            if (extractor.hls) {
                fileUrl.hls = true
            }
        }
        file.urls.push(fileUrl)
    }
}

module.exports = AnitubeUAProvider