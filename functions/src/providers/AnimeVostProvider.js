import Provider from './DataLifeProvider'
import { extractObject, extractStringProperty } from '../utils/extractScriptVariable'
import urlencode from 'urlencode'
import superagent from 'superagent'
import convertPlayerJSPlaylist from '../utils/convertPlayerJSPlaylist'

class AnimeVostProvider extends Provider {
    constructor() {
        super('animevost', {
            scope: '.shortstory',
            selectors: {
                id: { selector: '.shortstoryHead a', transform: ($el) => urlencode($el.attr('href')) },
                name: '.shortstoryHead a',
                image: {
                    selector: '.shortstoryContent div > a > img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.shortstoryHead h1',
                image: {
                    selector: '.imgRadius',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: '.functionPanel',
                    transform: ($el) => {
                        let episodesData

                        for (const item of $el.nextAll('script').toArray()) {
                            if (item.children.length != 0) {
                                const script = item.children[0].data

                                episodesData = extractObject(script, 'data')

                                if (episodesData) break
                            }
                        }

                        if (!episodesData) return []

                        return Object.keys(episodesData)
                            .map((key, index) => {
                                const playerUrl = episodesData[key]
                                return {
                                    id: index,
                                    name: key,
                                    asyncSource: urlencode(playerUrl)
                                }
                            })
                    }
                }
            }
        })
    }

    async getSource(resultsId, sourceId) {
        const siteRes = await superagent
            .get(`${this.config.playerUrl}?play=${decodeURIComponent(sourceId)}&old=1`)
            .timeout(5000)
            .disableTLSCerts()

        const playerJsPlaylist = extractStringProperty(siteRes.text, 'file')

        return convertPlayerJSPlaylist(playerJsPlaylist)[0]
    }
}

export default AnimeVostProvider