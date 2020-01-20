const providers = require('./providers')

const provider = 'kinogo'
const id = 'https://kinogo.by/5423-rasskaz-sluzhanki-1-2-3-sezon__22-01.html'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line