const superagent = require('superagent')
const makeResponse = require('../utils/makeResponse')


module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    const input = JSON.parse(event.body)
    const { method, url, query, headers, body } = input


    const res = await superagent(method || 'GET', url)
        .set(headers || {})
        .query(query || {})
        .send(body)
        .ok(() => true)
    
    return makeResponse({
        status: res.status,
        headers: res.header,
        text: res.text,
        body: res.body
    })
}