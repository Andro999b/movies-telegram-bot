const providers = require('../providers')
const util = require('util')

const provider = 'anidub'
const id = 'https%3A%2F%2Fonline.anidub.com%2Fvideoblog%2F10182-pochemu-ne-stoit-smotret-boruto-naruto-luchshe.html'

console.log(decodeURIComponent(id));

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line