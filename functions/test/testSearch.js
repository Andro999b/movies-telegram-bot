const providers = require('../providers')
const util = require('util')

const providerName = 'kinovod'
// const providerName = 'seasonvar'
// const providerName = 'videocdn'
// const providerName = 'animevost'
// const providerName = 'nekomori'
// const providerName = '7serealov'
const searchQuery = 'Звездный путь'
// const searchQuery = 'терминатор          '
// const searchQuery = 'Скрытые вещи'
// const searchQuery = 'Клинок ведьм'
// const searchQuery = 'one punch'
// const searchQuery = 'ID: Вторжение'
// const searchQuery = 'Дорохедоро'
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
    .then((details) => console.log(details, util.inspect(details, false, null, true)))// eslint-disable-line