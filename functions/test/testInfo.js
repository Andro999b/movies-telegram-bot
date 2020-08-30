const providers = require('../providers')
const util = require('util')

const provider = 'anidub'
const id = 'https://online.anidub.com/anime_movie/2209-perfect-blue-sovershennaya-grust-bd-rip720p-51.html'

console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line