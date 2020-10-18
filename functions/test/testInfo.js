const providers = require('../providers')
const util = require('util')

const provider = 'kinogo'
const id = 'https://kinogo.by/5611-watch-online-movie-forma-golosa_koe-no-katachi_2016.html'

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line