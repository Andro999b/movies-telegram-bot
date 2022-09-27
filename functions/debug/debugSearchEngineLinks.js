const extractSearchEngineQuery = require('../src/utils/extractSearchEngineQuery')

extractSearchEngineQuery('https://some-url.com текст')
    .then((it) => console.log(it)) // eslint-disable-line no-console