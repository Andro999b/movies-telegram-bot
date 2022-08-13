const providers = require('../providers')
// const util = require('util')

const providerName = 'anigato'
// const providerName = 'anitubeua'
// const providerName = 'anidub'
// const providerName = 'animedia'
// const providerName = 'kinovod'
// const providerName = 'kinogo'
// const providerName = 'seasonvar'
// const providerName = 'eneyida'
// const providerName = 'animevost'
const searchQuery = 'Дорохедоро'

providers.searchOne(providerName, searchQuery)
    .then((results) => console.log('results', results.length, results))// eslint-disable-line 
    .catch(console.error)// eslint-disable-line