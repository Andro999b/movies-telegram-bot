import providers from '../src/providers'
import util from 'util'
import debugFactory from 'debug'
const debug = debugFactory('source')

const provider = 'animevost'
const id = ''
const source = '2147417328'

// eslint-disable-next-line no-console
debug('resultId', decodeURIComponent(id))
// eslint-disable-next-line no-console
debug('sourceId', decodeURIComponent(source))

providers.getSource(provider, id, source)
    .then((source) => debug('source',  util.inspect(source, false, null, true)))// eslint-disable-line