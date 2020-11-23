const providers = require('../providers')
const util = require('util')

const provider = 'kinogo'
const id = 'https%3A%2F%2Fkinogo.by%2F14452-fitnes-1-2-3-4-sezon.html'

console.log(decodeURIComponent(id));

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line