const providers = require('./providers')

const providerName = 'uakino'
// const searchQuery = 'веном'
const searchQuery = 'final space'

providers.searchOne(providerName, searchQuery)
    .then((results) => {
        console.log('results', results)// eslint-disable-line

        return results[0]
    }) 
    .then(({ id, provider }) => 
        providers.getInfo(provider, id)
    )
    .then((details) => console.log('details', details))// eslint-disable-line