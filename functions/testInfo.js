const providers = require('./providers')

const provider = 'animevost'
const id = 'https%3A%2F%2Fanimevost.org%2Ftip%2Ftv%2F1324-witchblade.html'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line