const extractSearchEngineQuery = require('../utils/extractSearchEngineQuery')

extractSearchEngineQuery('https://www.kinopoisk.ru/film/1313205/')
    .then((it) => console.log(it)) // eslint-disable-line no-console