const providers = require('./providers')

const provider = 'kinoukr'
const id = 'https://kinoukr.com/3942-kimnata-bazhan.html'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line