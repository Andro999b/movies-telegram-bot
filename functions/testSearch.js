const providers = require('./providers')

const providerName = 'nekomori'
// const providerName = 'exfs'
// const searchQuery = 'синяя книга'
// const searchQuery = 'терминатор          '
// const searchQuery = 'Мистер Робот'
// const searchQuery = 'Клинок ведьм'
// const searchQuery = 'one punch'
// const searchQuery = 'ID: Вторжение'
const searchQuery = 'Дорохедоро'
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