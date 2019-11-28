const providers = require('./providers')

providers.searchOne('exfs', 'Рик и морти')
    .then(console.log) // eslint-disable-line