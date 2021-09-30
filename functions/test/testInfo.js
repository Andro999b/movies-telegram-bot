const providers = require('../providers')
const util = require('util')

const provider = 'animedia'
const id = 'https://m43.animedia.pro/anime/megaloboks'

console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line