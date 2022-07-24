const tortugaExtractor = require('../utils/tortugawtfembed')
const util = require('util')

tortugaExtractor("https://tortuga.wtf/embed/768")
    .then((files) => console.log(util.inspect(files, false, null, true)))// eslint-disable-line
    .catch(console.error)