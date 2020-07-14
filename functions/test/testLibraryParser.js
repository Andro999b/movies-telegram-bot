const { filmsLibrary } = require('../library')
const util = require('util')

const query = 'детектив 2019-2020 page2'

console.log('params',  util.inspect(filmsLibrary._parseQuery(query), false, null, true))