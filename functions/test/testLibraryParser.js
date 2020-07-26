const { filmsLibrary } = require('../library')
const util = require('util')

const query = 'мультсерилы 2018 page2'

console.log('params',  util.inspect(filmsLibrary._parseQuery(query), false, null, true))