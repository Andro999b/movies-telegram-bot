const superagent = require('superagent')
const CryptoJS = require('crypto-js')
const makeResponse = require('../utils/makeResponse')

const password = 'iso10126'

module.exports = async (params) => {
    const { url } = params
    const siteRes = await superagent.get(url).timeout(5000)

    const { groups: { data } } = siteRes.text.match(/embedVal="(?<data>[^"]+)"/)

    const { videos } = JSON.parse(CryptoJS.AES.decrypt(data, password).toString(CryptoJS.enc.Utf8))

    for (const video of videos) {
        if(video.url.indexOf('fmoviesfree') != -1) {
            return makeResponse(null, 302, {
                Location: video.url
            })
        }
    }
}