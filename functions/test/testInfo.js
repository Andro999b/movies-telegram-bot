const providers = require('../providers')
const util = require('util')

const provider = 'anidub'
const id = 'https://online.anidub.com/anime/full/7905-uskorennyy-mir-accel-world.html'

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line