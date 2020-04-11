const providers = require('./providers')
const util = require('util')

const provider = '7serealov'
const id = 'http%3A%2F%2F7serialov.net%2Fload%2Fdrama%2Fdoktor_khaus_1%2F8-1-0-47'

console.log(decodeURIComponent(id));

providers.getInfo(provider, id)
    .then((details) => console.log('details',  util.inspect(details, false, null, true)))// eslint-disable-line