const providers = require('./providers')

const provider = 'kinogo'
const id = 'https%3A%2F%2Fkinogo.by%2F15022-jojo-no-kimy244-na-b244ken_2012_11-01.html'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line