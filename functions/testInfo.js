const providers = require('./providers')
const util = require('util')

const provider = 'kinovod'
const id = '%2Ffilm%2F2164-gorod-grehov'

providers.getInfo(provider, id)
    .then((details) => console.log('details',  util.inspect(details, false, null, true)))// eslint-disable-line