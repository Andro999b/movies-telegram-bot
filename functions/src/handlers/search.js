import providersService from '../providers'
import makeResponse from '../utils/makeResponse'
import isOriginAllowed from '../utils/isOriginAllowed'

export const handler = async (event) => {
    if (!isOriginAllowed(event))
        return makeResponse('forbiden', 403)

    let results = []

    if(event.queryStringParameters) {
        const { q } = event.queryStringParameters
        const { provider } = event.pathParameters

        if(q) {
            results = await providersService.search([provider], q)
        }
    }

    return makeResponse(results, 200, {
        'Access-Control-Allow-Origin': event.headers.origin
    })
}