const providers = require('../src/providers')
const util = require('util')

const provider = 'animevost'
const id = ''
const source = '2147417328'

// eslint-disable-next-line no-console
console.log('resultId', decodeURIComponent(id))
// eslint-disable-next-line no-console
console.log('sourceId', decodeURIComponent(source))

providers.getSource(provider, id, source)
    .then((source) => console.log('source',  util.inspect(source, false, null, true)))// eslint-disable-line