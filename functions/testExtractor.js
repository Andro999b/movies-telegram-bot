const extract = require('./extract')

const url = decodeURIComponent('https%3A%2F%2Fuploadvideo.info%2Fembed%2F93079%2F')

extract({
    url,
    type: 'uploadvideo'
}).then(console.log) // eslint-disable-line 