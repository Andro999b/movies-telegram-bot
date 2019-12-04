const providers = require('./providers')

providers.search(['exfs', 'animeVost', 'kinogo', 'baskino'], 'тетрадь')
    .then(console.log) // eslint-disable-line