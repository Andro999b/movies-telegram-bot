const providers = require('./providers')

const provider = 'yummyanime'
const id = '/catalog/item/vanpanchmen'

providers.getInfo(provider, id)
    .then((details) => console.log('details', details))// eslint-disable-line