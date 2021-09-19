const providers = require('../providers')
const util = require('util')

// const provider = 'animevost'
const provider = 'rezka'
const id = ''
// const source = '2147415932'
const source = 'eyJkYXRhSWQiOiI0MTY1NiIsInNlYXNvbiI6IjEiLCJlcGlzb2RlIjoiMSIsInRyYW5zbGF0b3JJZCI6IjU2In0='

console.log('resultId', decodeURIComponent(id))
console.log('sourceId', decodeURIComponent(source))

providers.getSource(provider, id, source)
    .then((source) => console.log('source',  util.inspect(source, false, null, true)))// eslint-disable-line