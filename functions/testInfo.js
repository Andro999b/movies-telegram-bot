const providers = require('./providers')

providers.getInfo('exfs', 'http%3A%2F%2Fex-fs.net%2Fcartoon%2F9652-yuzhnyy-park.html')
    .then(console.dir) // eslint-disable-line