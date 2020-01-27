const providers = require('./providers')

const provider = '7serealov'
const id = 'http%3A%2F%2F7serialov.net%2Fload%2Fmultserialy%2Farcher%2F67-1-0-465'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line