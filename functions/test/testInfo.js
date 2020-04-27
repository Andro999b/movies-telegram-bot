const providers = require('../providers')
const util = require('util')

const provider = 'seasonvar'
const id = '/serial-24215-Svyatoj_Majk-2-season.html'

console.log(decodeURIComponent(id));

providers.getInfo(provider, id)
    .then((details) => console.log('details',  util.inspect(details, false, null, true)))// eslint-disable-line