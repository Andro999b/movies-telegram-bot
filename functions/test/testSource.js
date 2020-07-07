const providers = require('../providers')
const util = require('util')

const provider = 'anidub'
const id = 'https%3A%2F%2Fanimego.org%2Fanime%2Fdorohedoro2-1455'
const source = '%2Fplayer%2Findex.php%3Fvid%3D%2Fs1%2F11019%2F1%2F1.mp4%26url%3D%2Fanime%2Ffull%2F11115-dorohedoro-dorohedoro-anons.html%26id%3D-1'

console.log('resultId', decodeURIComponent(id));
console.log('sourceId', decodeURIComponent(source));

providers.getSource(provider, id, source)
    .then((source) => console.log('source',  util.inspect(source, false, null, true)))// eslint-disable-line