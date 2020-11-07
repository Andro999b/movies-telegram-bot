const providers = require('../providers')
const util = require('util')

const provider = 'videocdn'
const id = 'tv-series_208'

console.log(decodeURIComponent(id));

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line