const providers = require('../providers')
const util = require('util')

const provider = 'seasonvar'
const id = '%2Fserial-24137-Grand_Tur-4-sezon.html'

console.log(decodeURIComponent(id));

providers.getInfo(provider, id)
    .then((details) => console.log('details',  util.inspect(details, false, null, true)))// eslint-disable-line