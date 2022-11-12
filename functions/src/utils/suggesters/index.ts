import cleanupQuery from '../cleanupQuery.js'
import compositeSuggestion from './compositeSuggestion.js'
import kinobazaSuggestions from './kinobazaSuggestions.js'
import yandexSpellerSuggestion from './yandexSpellerSuggestion.js'

export type Suggester = (searchQuery: string, lang?: string) => Promise<string[]>

const getSuggestions = async (suggester: Suggester, searchQuery: string, lang: string): Promise<string[]> => {
  const lowerSearchQuery = searchQuery.toLowerCase()
  return (await suggester(cleanupQuery(searchQuery), lang))
    .filter((s) => s.toLowerCase() != lowerSearchQuery)
}

export default {
  ua: (searchQuery: string): Promise<string[]> => getSuggestions(kinobazaSuggestions, searchQuery, 'uk'),
  films: (searchQuery: string, lang: string): Promise<string[]> => getSuggestions(
    compositeSuggestion([kinobazaSuggestions, yandexSpellerSuggestion]),
    searchQuery,
    lang
  ),
  anime: (searchQuery: string, lang: string): Promise<string[]> => getSuggestions(yandexSpellerSuggestion, searchQuery, lang)
}