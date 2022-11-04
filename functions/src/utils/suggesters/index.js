import cleanupQuery from '../cleanupQuery'
import compositeSuggestion from './compositeSuggestion'
import kinobazaSuggestions from './kinobazaSuggestions'
import yandexSpellerSuggestion from './yandexSpellerSuggestion'

const getSuggestions = async (suggester, searchQuery) => {
    const lowerSearchQuery = searchQuery.toLowerCase()
    return (await suggester(cleanupQuery(searchQuery)))
        .filter((s) => s.toLowerCase() != lowerSearchQuery)
}

export default {
    ua: async (searchQuery) => getSuggestions(kinobazaSuggestions, searchQuery),
    films: async (searchQuery) => getSuggestions(
        compositeSuggestion([kinobazaSuggestions, yandexSpellerSuggestion]),
        searchQuery
    ),
    anime: async (searchQuery) => getSuggestions(yandexSpellerSuggestion, searchQuery)
}