const providers = require('../providers')
const util = require('util')

const provider = 'seasonvar'
const id = 'http://seasonvar.ru/serial-27490-Epidemiya_2019.html'

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line