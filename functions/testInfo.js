const providers = require('./providers')

const provider = 'exfs'
const id = 'http://ex-fs.net/films/3804-garri-potter-i-princ-polukrovka.html'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line