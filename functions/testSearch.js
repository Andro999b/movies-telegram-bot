const providers = require('./providers')

const providerName = 'videocdn'
// const providerName = 'uaserials'
// const searchQuery = 'Террор'
// const searchQuery = 'Venom'
const searchQuery = 'Final Space'
// const searchQuery = 'Клинок ведьм'
// const searchQuery = 'one punch'
// const searchQuery = 'веном'

providers.searchOne(providerName, searchQuery)
    .then((results) => {
        console.log('results', results)// eslint-disable-line

        return results[0]
    }) 
    // .then(({ id, provider }) => 
    //     providers.getInfo(provider, id)
    // )
    // .then((details) => console.log('details', details))// eslint-disable-line