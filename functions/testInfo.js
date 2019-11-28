const providers = require('./providers')

providers.getInfo('exfs', 'http%3A%2F%2Fex-fs.net%2Fseries%2F39743-rik-i-morti.html')
    .then(console.dir) // eslint-disable-line