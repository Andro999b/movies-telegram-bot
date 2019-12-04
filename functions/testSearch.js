const providers = require('./providers')

const providerName = 'baskino'
const searchQuery = 'шазам'

providers.searchOne(providerName, searchQuery)
    .then((results) => {
        console.log('results', results)// eslint-disable-line

        return results[0]
    }) 
    .then(({ id, provider }) => 
        providers.getInfo(provider, id)
    )
    .then((details) => console.log('details', details))// eslint-disable-line