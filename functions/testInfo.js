const providers = require('./providers')

providers.getInfo('animeVost', 'https%3A%2F%2Fanimevost.org%2Ftip%2Ftv%2F2084-overlord-3rd-season12.html')
    .then(console.dir) // eslint-disable-line