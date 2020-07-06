const providers = require('../providers')
const util = require('util')

const provider = 'nekomori'
const id = '91'

console.log(decodeURIComponent(id));

providers.getInfo(provider, id)
    .then((details) => console.log('details',  util.inspect(details, false, null, true)))// eslint-disable-line