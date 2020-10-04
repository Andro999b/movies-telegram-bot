const providers = require('../providers')
const util = require('util')

const provider = 'seasonvar'
const id = 'http://seasonvar.ru/serial-26550-Skvoz__sneg-2-season.html'

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line