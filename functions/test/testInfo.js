const providers = require('../providers')
const util = require('util')

const provider = 'kinogo2'
const id = 'https%3A%2F%2Fkinogo.cc%2F48814-ya-robot-i-robot-kinogo-2004.html'

console.log(decodeURIComponent(id));

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line