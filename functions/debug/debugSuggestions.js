const suggesters = require('../src/utils/suggesters')

// eslint-disable-next-line no-console
suggesters.films('дневники вампира').then((it) => console.log(it))
