const providers = require('../providers')
const util = require('util')

const provider = 'kinogo'
const id = 'https%3A%2F%2Fkinogo.appspot.com%2F19474-terminator-dark-fate_2019__14-01.html'

console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line