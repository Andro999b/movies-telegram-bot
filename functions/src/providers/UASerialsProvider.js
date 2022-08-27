const Provider = require('./CFDataLifeProvider')
const CryptoJS = require('crypto-js')
const urlencode = require('urlencode')

class UASerialsProvider extends Provider {
    constructor() {
        super('uaserials', {
            scope: '.short-item',
            selectors: {
                id: {
                    selector: '.short-img',
                    transform: ($el) => urlencode($el.attr('href'))
                },
                name: '.th-title',
                image: {
                    selector: '.short-img img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: 'h1.short-title',
                image: {
                    selector: '.fimg img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: 'player-control',
                    transform: async ($el) => {
                        const { password } = this.config
                        const data = JSON.parse($el.attr('data-tag'))

                        const encrypted = data.ciphertext
                        const salt = CryptoJS.enc.Hex.parse(data.salt)
                        const iv = CryptoJS.enc.Hex.parse(data.iv)

                        const key = CryptoJS.PBKDF2(password, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: 999 })

                        const decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv: iv })
                        const tabsObject = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8).replace(/\\/g, ''))
                        const playerTab = tabsObject[0]

                        if (playerTab.url) {
                            return [{
                                id: 0,
                                urls: [{
                                    url: playerTab.url,
                                    hls: true,
                                    extractor: { type: 'tortuga' }
                                }]
                            }]
                        } else {
                            let id = 0
                            return playerTab.seasons.flatMap(({ title, episodes }) => {
                                return episodes.flatMap((e) => ({
                                    id: id++,
                                    name: e.title,
                                    path: title,
                                    urls: e.sounds.map((s) => ({
                                        extractor: { type: 'tortuga' },
                                        hls: true,
                                        url: s.url,
                                        audio: s.title
                                    }))
                                }))
                            })
                        }
                    }
                }
            }
        })
    }
}

module.exports = UASerialsProvider