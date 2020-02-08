const providers = require('./providers')

const provider = '7serealov'
const id = 'http://7serialov.net/load/drama/polovoe_vospitanie_seksualnoe_vospitanie_1/8-1-0-1429'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line