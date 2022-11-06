import cleanupQuery from '../cleanupQuery'
import compositeSuggestion from './compositeSuggestion'
import kinobazaSuggestions from './kinobazaSuggestions'
import yandexSpellerSuggestion from './yandexSpellerSuggestion'

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