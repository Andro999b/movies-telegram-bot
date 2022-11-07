import cleanupQuery from '../cleanupQuery.js'
import compositeSuggestion from './compositeSuggestion.js'
import kinobazaSuggestions from './kinobazaSuggestions.js'
import yandexSpellerSuggestion from './yandexSpellerSuggestion.js'

export type Suggester = (searchQuery: string) => Promise<string[]>

const getSuggestions = async (suggester: Suggester, searchQuery: string): Promise<string[]> => {
  const lowerSearchQuery = searchQuery.toLowerCase()
  return (await suggester(cleanupQuery(searchQuery)))
    .filter((s) => s.toLowerCase() != lowerSearchQuery)
}

export default {
  ua: (searchQuery: string): Promise<string[]> => getSuggestions(kinobazaSuggestions, searchQuery),
  films: (searchQuery: string): Promise<string[]> => getSuggestions(
    compositeSuggestion([kinobazaSuggestions, yandexSpellerSuggestion]),
    searchQuery
  ),
  anime: (searchQuery: string): Promise<string[]> => getSuggestions(yandexSpellerSuggestion, searchQuery)
}