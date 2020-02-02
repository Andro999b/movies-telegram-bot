const providers = require('./providers')

const provider = 'videocdn'
const id = 'movies_34656'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line