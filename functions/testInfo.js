const providers = require('./providers')
const util = require('util')

const provider = '7serealov'
const id = 'http://7serialov.net/load/komedija/druzja_46/10-1-0-51'

providers.getInfo(provider, id)
    .then((details) => console.log('details',  util.inspect(details, false, null, true)))// eslint-disable-line