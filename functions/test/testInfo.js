const providers = require('../providers')
const util = require('util')

const provider = 'animedia'
const id = '%2Fanime%2Fvtorjenie-gigantov'

console.log(decodeURIComponent(id));

providers.getInfo(provider, id).then()
    .then((details) => console.log(util.inspect(details, false, null, false)))// eslint-disable-line