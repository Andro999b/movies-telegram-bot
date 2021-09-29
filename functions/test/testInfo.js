const providers = require('../providers')
const util = require('util')

const provider = 'anigato'
const id = 'https%3A%2F%2Fanigato.org%2Fanime_ova%2F5202-trava-mezhplanetnyj-kulak.html'

console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line