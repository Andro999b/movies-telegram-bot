const providers = require('./providers')

const provider = 'kinogo'
const id = 'https%3A%2F%2Fkinogo.by%2F22429-the-irishman_2019.html'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line