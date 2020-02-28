const providers = require('./providers')

const provider = '7serealov'
const id = 'http://7serialov.net/load/komedija/atlanta/10-1-0-147'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line