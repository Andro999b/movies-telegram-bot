const providers = require('./providers')

const provider = 'kinoukr'
const id = 'https://kinoukr.com/4013-gostri-kartuzy.html'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line