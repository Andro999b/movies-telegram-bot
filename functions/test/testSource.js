const providers = require('../providers')
const util = require('util')

const provider = 'animevost'
const id = ''
const source = 'https%3A%2F%2Fplay.roomfish.ru%2F2147415900'

console.log('resultId', decodeURIComponent(id));
console.log('sourceId', decodeURIComponent(source));

providers.getSource(provider, id, source)
    .then((source) => console.log('source',  util.inspect(source, false, null, true)))// eslint-disable-line