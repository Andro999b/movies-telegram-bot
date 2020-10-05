const providers = require('../providers')
const util = require('util')

const provider = 'seasonvar'
const id = 'http://seasonvar.ru/serial-26448-Vdali.html'

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line