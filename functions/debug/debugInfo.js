const providers = require('../src/providers')
const util = require('util')

const provider = 'anigato'
const id = 'https://anigato.ru/anime_movie/7926-slova-puzyrjatsja-podobno-gazirovke.html'
// const id = 'https://uaserials.pro/6573-nastupni-365-dniv.html'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)