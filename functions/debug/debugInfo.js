const providers = require('../src/providers')
const util = require('util')

const provider = 'anigato'
const id = 'https://anigato.ru/anime/3321-dorohedoro.html'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)