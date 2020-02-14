const providers = require('./providers')

const provider = 'nekomori'
const id = '65'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line