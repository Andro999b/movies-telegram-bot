const providers = require('../providers')
const util = require('util')

const provider = 'animedia'
const id = '%2Fanime%2Fdorohedoro'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)