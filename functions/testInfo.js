const providers = require('./providers')
const util = require('util')

const provider = 'kinogo'
const id = 'https://kinogo.by/22883-strelcov_2020.html'

providers.getInfo(provider, id)
    .then((details) => console.log('details',  util.inspect(details, false, null, true)))// eslint-disable-line