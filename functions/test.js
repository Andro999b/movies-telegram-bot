const PAGE_SIZE = 3

function getResults(providersResults, page) {
    const chunks = []

    for (let cur = 0; cur < page; cur++) {
        providersResults
            .map((res) => res.slice(cur * PAGE_SIZE, (cur + 1) * PAGE_SIZE))
            .filter((chunk) => chunk.length)
            .forEach((chunk) => chunks.push(chunk))
    }
    
    const totalItems = providersResults.reduce((acc, items) => acc + items.length, 0)
    const results = chunks.reduce((acc, items) => acc.concat(items), [])
    const hasMore = totalItems > results.length

    return {
        results,
        hasMore
    }
}

console.log(getResults([['t1', 't1', 't3', 't5'], ['t2'], ['t3']], 2))