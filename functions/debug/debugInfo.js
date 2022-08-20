const providers = require('../src/providers')
const util = require('util')

const provider = 'kinogo'
const id = 'https%3A%2F%2Fkinogo.la%2F14967-gary-and-his-demons_2018.html'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)