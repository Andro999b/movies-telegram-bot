const { filmsLibrary } = require('../library')
const makeResponse = require('../utils/makeResponse')

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    const { type, q } = event.queryStringParameters

    switch (type) {
        case 'top':
            return makeResponse(await filmsLibrary.top(q))
        case 'people':
            return makeResponse(await filmsLibrary.people(q))
    }

    return makeResponse('Unknow type', 400)
}