const providers = require('../providers')
const util = require('util')

const provider = 'animevost'
const id = ''
const source = '2147410839'

console.log('resultId', decodeURIComponent(id))
console.log('sourceId', decodeURIComponent(source))

providers.getSource(provider, id, source)
    .then((source) => console.log('source',  util.inspect(source, false, null, true)))// eslint-disable-line