const providers = require('../src/providers')
const util = require('util')

const provider = 'uaserials'
const id = 'https%3A%2F%2Fuaserials.pro%2F196-zoryana-brama-sezon-1.html'
// const id = 'https://uaserials.pro/6573-nastupni-365-dniv.html'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)