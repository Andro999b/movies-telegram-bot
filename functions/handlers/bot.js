
const makeResponse = require('../utils/makeResponse')
const superagent = require('superagent')

const token = '1009613571:AAHyGk-2jjuLg-6ckbgj7QoKwi3YIVVS_aQ';

module.exports = async (event) => {
    const body = JSON.parse(event.body)

    const message = body.message
    const chatId = message.chat.id
    const BASE_URL = `https://api.telegram.org/bot${token}/sendMessage`;

    await superagent
        .post(BASE_URL).type('form')
        .send({ text: message.text, chat_id: chatId })

    return makeResponse({ input: event })
}