const providers = require('../providers')
const util = require('util')

const provider = 'kinogo'
const id = 'https%3A%2F%2Fkinogo.by%2F23000-little-women_2019.html'

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line