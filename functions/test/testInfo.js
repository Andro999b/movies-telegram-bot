const providers = require('../providers')
const util = require('util')

const provider = 'anitubeua'
const id = 'https%3A%2F%2Fanitube.in.ua%2F3948-spy-x-family.html'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)