const providers = require('../providers')
const util = require('util')

// const providerName = 'anidub'
// const providerName = 'animedia'
// const providerName = 'kinovod'
// const providerName = 'kinogo'
const providerName = 'seasonvar'
// const providerName = 'videocdn'
// const providerName = 'animevost'
// const providerName = 'nekomori'
// const providerName = '7serealov'
// const searchQuery = 'Звездный путь'
// const searchQuery = 'Синяя книга'
// const searchQuery = 'терминатор          '
// const searchQuery = 'Скрытые вещи'
// const searchQuery = 'Клинок ведьм'
// const searchQuery = 'Харли квин'
// const searchQuery = 'one punch'
// const searchQuery = 'ID: Вторжение'
// const searchQuery = 'Дорохедоро'
// const searchQuery = 'Принц-дракон'
// const searchQuery = 'Полуночная проповедь'
const searchQuery = 'Дрянь'
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
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line