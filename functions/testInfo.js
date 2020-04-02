const providers = require('./providers')
const util = require('util')

const provider = 'kinogo'
const id = 'https://kinogo.by/258-piraty-karibskogo-morya-na-krayu-sveta_2007-27-12.html'

providers.getInfo(provider, id)
    .then((details) => console.log('details',  util.inspect(details, false, null, true)))// eslint-disable-line