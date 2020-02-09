const extractSearchEngineQuery = require('./utils/extractSearchEngineQuery')

const searchQuery = 'https://g.co/kgs/bP1q8D'

async function test(query){
    const parts = query.match(/http?s:\/\/[^\s]+/)

    if(parts && parts.length > 0) {
        const searchEngineQuery = await extractSearchEngineQuery(parts[0])
        query = searchEngineQuery
    }

    console.log(query);
}

test(searchQuery).then()