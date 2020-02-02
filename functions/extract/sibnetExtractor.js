const superagent = require('superagent')
const makeResponse = require('../utils/makeResponse')

module.exports = async (params) => {
    const { url } = params

    const siteRes = await superagent.get(url)
        .timeout(5000)

    return makeResponse(siteRes.text, 302)

        // for(let extractExpr of regExps) {
        //     const matches = siteRes.text.match(extractExpr)

        //     if(matches == null || matches.length < 1)
        //         continue

        //     const videoUrl = matches[matches.length - 1]        

        //     return makeResponse(null, 302, {
        //         Location: videoUrl
        //     })
        // }

        // throw Error('Video can`t be extracted', params)
    }