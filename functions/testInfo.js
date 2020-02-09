const providers = require('./providers')

const provider = 'videocdn'
const id = 'tv-series_3339'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line