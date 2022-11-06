import { Suggester } from './index.js'

export default (suggesters: Suggester[]): Suggester => {
  return async (searchQuery: string) => {
    const results = await Promise.all(
      suggesters.map((suggester) => suggester(searchQuery))
    )

    return Array.from(
      new Set(
        results.flatMap((it) => it)
          .map((it) => it.toLowerCase())
      )
    )
  }
}