const providers = require('../providers')
const util = require('util')

const provider = 'seasonvar'
const id = '/serial-24146-Vsegda_vesna.html'

console.log(decodeURIComponent(id));

providers.getInfo(provider, id)
    .then((details) => console.log('details',  util.inspect(details, false, null, true)))// eslint-disable-line