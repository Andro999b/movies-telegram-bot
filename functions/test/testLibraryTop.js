const { filmsLibrary } = require('../library')
const util = require('util')

const query = 'мультсериал 2019-2020 page2'

filmsLibrary
    .top(query)
    .then((results) => console.log('details',  util.inspect(results, false, null, true)))