const bot = require('../handlers/bot')
const message = require('./data/message.json')
const util = require('util')

bot
    .handler({ body: JSON.stringify(message) })
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
