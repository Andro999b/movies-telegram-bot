const providers = require('../providers')
const util = require('util')

const provider = 'kinogo'
const id = 'https://kinogo.by/22420-kuhnya-voyna-za-otel-1-2-sezon___07-01.html'

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line