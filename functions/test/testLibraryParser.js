const { filmsLibrary } = require('../library')
const util = require('util')

const query = 'ужасы 2019-2020 page2'

console.log('params',  util.inspect(filmsLibrary._parseQuery(query), false, null, true))