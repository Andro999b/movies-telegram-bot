const providers = require('./providers')

providers.getInfo('kinogo', 'https%3A%2F%2Fkinogo.by%2F20910-the-mandalorian_17-11.html')
    .then(console.dir) // eslint-disable-line