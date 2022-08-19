const providers = require('../src/providers')

const providerName = 'anigato'
// const providerName = 'anitubeua'
// const providerName = 'anidub'
// const providerName = 'animedia'
// const providerName = 'animevost'
// const providerName = 'kinovod'
// const providerName = 'kinogo'
// const providerName = 'seasonvar'
// const providerName = 'eneyida'
// const providerName = 'uafilmtv'
const searchQuery = 'Дорохедоро'

providers.searchOne(providerName, searchQuery)
    .then((results) => console.log('results', results.length, results))// eslint-disable-line 
    .catch(console.error)// eslint-disable-line