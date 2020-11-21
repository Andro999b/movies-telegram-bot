const { filmsLibrary } = require('../library')
const util = require('util')

const query = 'мультсерилы 2018 page2'

filmsLibrary.top(query).then((res) => util.inspect(res, false, null, true))