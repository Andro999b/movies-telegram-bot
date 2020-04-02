const providers = require('./providers')

const provider = 'kinogo'
const id = 'https://kinogo.by/258-piraty-karibskogo-morya-na-krayu-sveta_2007-27-12.html'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line