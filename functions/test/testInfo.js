const providers = require('../providers')
const util = require('util')

const provider = 'kinogo'
const id = 'https://kinogo.la/11741-zvezdnyy-put-1-sezon.html'

console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)