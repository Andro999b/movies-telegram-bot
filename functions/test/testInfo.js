const providers = require('../providers')
const util = require('util')

const provider = 'kinovod'
const id = '%2Ffilm%2F518-terminator-2-sudnyj-den'

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line