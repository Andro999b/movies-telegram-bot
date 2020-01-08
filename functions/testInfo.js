const providers = require('./providers')

const provider = 'videocdn'
const id = '2125'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line