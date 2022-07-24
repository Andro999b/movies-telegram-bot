const providers = require('../providers')
const util = require('util')

const provider = 'anitubeua'
const id = 'https://85.208.185.25//2091-moya-pokrna-diyavolska-sestrichka-shinmai-maou-no-testament.html'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)