const cleanupQuery = require('../cleanupQuery')
const kinobazaSuggestions = require('./kinobazaSuggestions')
const yandexSpellerSuggestion = require('./yandexSpellerSuggestion')

const getSuggestions = async (suggester, searchQuery) => {
    const lowerSearchQuery = searchQuery.toLowerCase()
    return (await suggester(cleanupQuery(searchQuery)))
        .filter((s) => s.toLowerCase() != lowerSearchQuery)
}

module.exports = {
    ua: async (searchQuery) => getSuggestions(kinobazaSuggestions, searchQuery),
    films: async (searchQuery) => getSuggestions(yandexSpellerSuggestion, searchQuery),
    anime: async (searchQuery) => getSuggestions(yandexSpellerSuggestion, searchQuery)
}