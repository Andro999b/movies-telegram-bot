const DataLifeProvider = require('./DataLIfeProvider')
const urlencode = require('urlencode')
const CryptoJS = require('crypto-js')
// const superagent = require('superagent')
// const convertPlayerJSPlaylist = require('../utils/convertPlayerJSPlaylist')

class EXFSProvider extends DataLifeProvider {
    constructor() {
        super('uaserials', {
            scope: '.mov',
            selectors: {
                id: {
                    selector: 'a.mov-title-ua',
                    transform: ($el) => urlencode($el.attr('href'))
                },
                name: 'a.mov-title-ua',
                image: {
                    selector: '.img-box img',
                    transform: ($el) => $el.attr('src')
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.full-title h1',
                image: {
                    selector: '.mov-img img',
                    transform: ($el) => $el.attr('src')
                },
                files: {
                    selector: '.ua-serials',
                    transform: async ($el) => {
                        const players = this._decrypt(JSON.parse($el.attr('data-tag')))
                        const { seasons } = players[0]

                        if(seasons) {
                            return seasons.map(({title, episodes}) => 
                                episodes.map((episode) => {
                                    const file = this._getFile(episode.sounds[0])
                                    return file && {   
                                        ...file,
                                        name: `${title} / ${episode.title}`,
                                        path: title,
                                    }   
                                })
                                    .filter((it) => it)
                            )
                                .reduce((acc, item) => acc.concat(item), [])
                        } else {
                            return []
                        }
                    }
                }
            }
        })
    }

    _getFile({ url }) {
        if(url.indexOf('tortuga') != -1) {
            return {
                manifestUrl: url,
                extractor: { type: 'tortuga' }
            }
        } else if(url.indexOf('uploadvideo') != -1) {
            return {
                url: url,
                extractor: { type: 'uploadvideo' }
            }
        }
    }

    _decrypt({ salt, iv, ciphertext }) {
        const { password } = this.config

        const key = CryptoJS.PBKDF2(
            password,
            CryptoJS.enc.Hex.parse(salt),
            {
                hasher: CryptoJS.algo.SHA512,
                keySize: 64 / 8,
                iterations: 999
            }
        )
        const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
            iv: CryptoJS.enc.Hex.parse(iv)
        })

        return JSON.parse(
            decrypted.toString(CryptoJS.enc.Utf8).replace(/\\/g, '')
        )
    }
}

module.exports = EXFSProvider