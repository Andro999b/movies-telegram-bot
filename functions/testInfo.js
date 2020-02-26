const providers = require('./providers')

const provider = 'kinogo'
const id = 'https://kinogo.by/5808-watch-online-movie-boycovskiy-klub_fight-club_1999.html'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line