const providers = require('../providers')
const util = require('util')

const provider = 'anigato'
const id = 'https%3A%2F%2Fanigato.ru%2Fanime%2F3321-dorohedoro.html'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)