import cleanupQuery from '../cleanupQuery'
import compositeSuggestion from './compositeSuggestion'
import kinobazaSuggestions from './kinobazaSuggestions'
import yandexSpellerSuggestion from './yandexSpellerSuggestion'

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