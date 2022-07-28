const extractor = require('../utils/videocdnembed')
const util = require('util')

extractor("https://video.kinogo.lu/33cHYTFTAlwP/tv-series/3672")
    .then((files) => console.log(util.inspect(files, false, null, true)))// eslint-disable-line
    .catch(console.error)