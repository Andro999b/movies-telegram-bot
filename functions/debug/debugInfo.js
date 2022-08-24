const providers = require('../src/providers')
const util = require('util')
const debug = require('debug')('info')

const provider = 'animedia'
const id = '%2Fanime%2Fdorohedoro'

// eslint-disable-next-line no-console
debug(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => debug(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)