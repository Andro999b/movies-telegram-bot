const providers = require('../providers')
const util = require('util')

const provider = 'nekomori'
const id = ''
const source = 'CfDJ8BwC2XOV9qJJj7dxaoZ6OOUgk_XRwP3VpaY7aNNq7WGJAP-pYFzNiFZs_tmb0dhQPVzdMf8WilcDL6lrD2pM6_TBIZ4ujWzVBTpE2DFaxdriMlJ3fnOb1KWGZ5s1q-vjiohn8hkaNV56a3oMAEqyZ4c-GJO7wkNge8xeR4lblkVZaOLuniWMpkabOIZa_UrdVXKUMre-TMgmaaCtzrUnps47S5FTGctAun44Hn9GwcWzYAYbI1FUwtv-0vqNO14SPg:12'

console.log('resultId', decodeURIComponent(id))
console.log('sourceId', decodeURIComponent(source))

providers.getSource(provider, id, source)
    .then((source) => console.log('source',  util.inspect(source, false, null, true)))// eslint-disable-line