import providers from '../src/providers'
import util from 'util'
import debugFactory from 'debug'
const debug = debugFactory('info')

const provider = 'anitubeua'
const id = 'https%3A%2F%2Fanitube.in.ua%2F3948-spy-x-family.html'

// eslint-disable-next-line no-console
debug(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => debug(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)