import extractors from '../extract'

export const handler = async (event) => {
    const response = await extractors(event.queryStringParameters, event.headers)
    
    response.headers['Access-Control-Allow-Origin'] = '*'

    return response
}