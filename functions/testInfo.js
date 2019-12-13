const providers = require('./providers')

const provider = 'exfs'
const id = 'http%3A%2F%2Fex-fs.net%2Fseries%2F98347-kuhnya-voyna-za-otel.html'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line