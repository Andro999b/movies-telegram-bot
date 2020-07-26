const providers = require('../providers')
const util = require('util')

const provider = 'kinogo2'
const id = 'https%3A%2F%2Fkinogo.cc%2F26621-gubka-bob-v-3d-the-spongebob-movie-sponge-out-of-water-kinogo-2015.html'

console.log(decodeURIComponent(id));

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line