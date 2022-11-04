import superagent from 'superagent'
import makeResponse from '../utils/makeResponse'

export default (patterns) => async (params) => {
    const { url } = params
    const targetUrl = url.startsWith('//') ? 'https:' + url : url

    const siteRes = await superagent
        .get(targetUrl)
        .timeout(5000)
        .disableTLSCerts()

    for(let pattern of patterns) {
        let expression
        let transform = (m) => m[m.length - 1]  

        if(pattern instanceof RegExp) {
            expression = pattern
        } else if(typeof pattern === 'string') {
            expression = new RegExp(pattern)
        } else {
            expression = pattern.expression
            transform = pattern.transform
        }

        const matches = siteRes.text.match(expression)

        if(matches == null || matches.length < 1)
            continue    

        return makeResponse(null, 302, {
            Location: await transform(matches)
        })
    }
    
    console.error('Video can`t be extracted', params)

    return makeResponse({ message: 'Video can`t be extracted'}, 404)
}