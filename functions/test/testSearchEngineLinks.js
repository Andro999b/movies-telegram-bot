const extractSearchEngineQuery = require('../utils/extractSearchEngineQuery')

extractSearchEngineQuery('https://test.com').then((it) => console.log(it))