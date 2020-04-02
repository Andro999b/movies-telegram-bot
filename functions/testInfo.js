const providers = require('./providers')
const util = require('util')

const provider = 'kinovod'
const id = '/film/36039-kings-man-nachalo'

providers.getInfo(provider, id)
    .then((details) => console.log('details',  util.inspect(details, false, null, true)))// eslint-disable-line