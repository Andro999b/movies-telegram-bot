const providers = require('./providers')

providers.getInfo('exfs', 'http%3A%2F%2Fex-fs.net%2Fcartoon%2F71249-boss-molokosos.html')
    .then(console.dir) // eslint-disable-line