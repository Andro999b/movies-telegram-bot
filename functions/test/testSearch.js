const providers = require('../providers')
// const util = require('util')

// const providerName = 'anigato'
// const providerName = 'anitubeua'
const providerName = 'anidub'
// const providerName = 'animedia'
// const providerName = 'kinovod'
// const providerName = 'kinogo'
// const providerName = 'seasonvar'
// const providerName = 'videocdn'
// const providerName = 'animevost'
const searchQuery = 'Владыка'

providers.searchOne(providerName, searchQuery)
    .then((results) => console.log('results', results.length, results))// eslint-disable-line 
    .catch(console.error)// eslint-disable-line