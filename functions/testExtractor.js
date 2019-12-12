const extract = require('./extract')

extract({
    url: decodeURIComponent('https%3A%2F%2Fuploadvideo.info%2Fembed%2F93079%2F'),
    type: 'uploadvideo'
}).then(console.log) // eslint-disable-line 