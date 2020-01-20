const providers = require('./providers')

const provider = 'kinogo'
const id = 'https://kinogo.by/3105-hroniki-prizrachnogo-plemeni-2015.html'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line