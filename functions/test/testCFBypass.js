const invokeCFBypass = require('../utils/invokeCFBypass')
const url = 'https://corsproxy.movies-player.workers.dev/?https://rezka.ag/animation/action/2373-kovboy-bibop-2001.html'

invokeCFBypass(url)
    // eslint-disable-next-line no-console
    .then(({ text }) => console.log(text))