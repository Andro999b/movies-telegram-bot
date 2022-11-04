export default (suggesters) => {
    return async (searchQuery) => {
        const results = await Promise.all(
            suggesters.map(async (suggester) => suggester(searchQuery))
        )

        return Array.from(
            new Set(
                results.flatMap((it) => it)
                    .map((it) => it.toLowerCase())
            )
        )
    }
}