const providers = require('../providers')
const util = require('util')

const provider = 'kinogo'
const id = 'https://kinogo.by/20434-pacany-1-2-sezon.html'

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line