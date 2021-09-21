const providers = require('../providers')
const util = require('util')

const provider = 'rezka'
// const id = 'https%3A%2F%2Frezka.ag%2Fcartoons%2Faction%2F32692-harli-kvinn-2019.html'
const id = 'https://rezka.ag/films/fiction/40288-dyuna-2021.html'

console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line