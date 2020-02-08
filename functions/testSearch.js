const providers = require('./providers')

const providerName = 'kinogo'
const searchQuery = 'синяя книга'
// const searchQuery = 'Venom'
// const searchQuery = 'Мистер Робот'
// const searchQuery = 'Клинок ведьм'
// const searchQuery = 'one punch'
// const searchQuery = 'веном'
// const searchQuery = 'ванпанчмен'

providers.searchOne(providerName, searchQuery)
    .then((results) => {
        console.log('results', results)// eslint-disable-line

        return results[0]
    }) 
    .then(({ id, provider }) => 
        providers.getInfo(provider, id)
    )
    .then((details) => console.log('details', details))// eslint-disable-line