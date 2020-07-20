const providers = require('../providers')
const util = require('util')

const provider = 'videocdn'
const id = 'tv-series_1666'

console.log(decodeURIComponent(id));

providers.getInfo(provider, id).then()
    .then((details) => console.log(util.inspect(details, false, null, false)))// eslint-disable-line