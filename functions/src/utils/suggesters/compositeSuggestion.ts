import { Suggester } from './index'

export default (suggesters: Suggester[]): Suggester => {
  return async (searchQuery: string, lang: string) => {
    const results = await Promise.all(
      suggesters.map((suggester) => suggester(searchQuery, lang))
    )

    return Array.from(
      new Set(
        results.flatMap((it) => it)
          .map((it) => it.toLowerCase())
      )
    )
  }
}