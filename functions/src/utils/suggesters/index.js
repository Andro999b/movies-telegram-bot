const cleanupQuery = require('../cleanupQuery')
const kinobazaSuggestions = require('./kinobazaSuggestions')
const yandexSpellerSuggestion = require('./yandexSpellerSuggestion')

module.exports = {
    ua: async (searchQuery) => kinobazaSuggestions(cleanupQuery(searchQuery)),
    films: async (searchQuery) => yandexSpellerSuggestion(cleanupQuery(searchQuery)),
    anime: async (searchQuery) => yandexSpellerSuggestion(cleanupQuery(searchQuery))
}