const providers = require('../providers')
const util = require('util')

const provider = 'animevost'
// const provider = 'rezka'
const id = ''
const source = '2147415932'
// const source = 'eyJkYXRhSWQiOiI5MzMzIiwic2Vhc29uIjoiNSIsImVwaXNvZGUiOiIxMyIsInRyYW5zbGF0b3JJZCI6IjU5In0='

console.log('resultId', decodeURIComponent(id))
console.log('sourceId', decodeURIComponent(source))

providers.getSource(provider, id, source)
    .then((source) => console.log('source',  util.inspect(source, false, null, true)))// eslint-disable-line