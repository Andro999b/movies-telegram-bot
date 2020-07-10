const { filmsLibrary } = require('../library')
const util = require('util')

const id = '1179789'

filmsLibrary
    .getInfoById(id)
    .then((results) => console.log('details',  util.inspect(results, false, null, true)))