const providers = require('../providers')
const util = require('util')

const provider = 'animego'
const id = 'https%3A%2F%2Fanimego.org%2Fanime%2Fdorohedoro2-1455'
const source = '19359'

console.log(decodeURIComponent(id));

providers.getSource(provider, id, source)
    .then((source) => console.log('source',  util.inspect(source, false, null, true)))// eslint-disable-line