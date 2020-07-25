const providers = require('../providers')
const util = require('util')

const provider = 'kinovod'
const id = '%2Ffilm%2F43786-pod-vodoj'

console.log(decodeURIComponent(id));

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, false)))// eslint-disable-line