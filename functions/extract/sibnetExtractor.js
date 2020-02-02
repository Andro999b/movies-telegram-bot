const superagent = require('superagent')
const makeResponse = require('../utils/makeResponse')

module.exports = async (params) => {
    const { url } = params

    const siteRes = await superagent.get(url)
        .timeout(5000)

    return makeResponse(siteRes.text, 302)
}