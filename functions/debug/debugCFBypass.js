const invokeCFBypass = require('../utils/invokeCFBypass')
const url = 'https://corsproxy.movies-player.workers.dev/?https://anitube.in.ua'

invokeCFBypass(url)
    // eslint-disable-next-line no-console
    .then(({ text }) => console.log(text))