const providers = require('../providers')
const util = require('util')

const provider = 'kinovod'
const id = '%2Ftv_show%2F158272-polnyj-blekaut'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)