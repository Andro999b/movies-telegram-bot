export const range = (to) => Array.from({ length: to }, (_, k) => k + 1)

export const getUserName = ({ firstname, lastname, username }) =>
    [firstname, lastname].join(' ') + (username ? ' @' + username : '')

export const segmentBucketReducer = (segmentExtractor, keyExtractor) => {
    return (acc, item) => {
        const segment = segmentExtractor(item)
        const key = keyExtractor(item)

        if (!key) return

        if (!acc.hasOwnProperty(segment)) {
            acc[segment] = {}
        }

        const segmentBucket = acc[segment]

        if (!segmentBucket.hasOwnProperty(key)) {
            segmentBucket[key] = 0
        }

        segmentBucket[key]++

        return acc
    }
}

export const uniqueBucketReducer = (segmentExtractor, keyExtractor) => {
    return (acc, item) => {
        const segment = segmentExtractor(item)
        const key = keyExtractor(item)

        if (!key) return

        if (!acc.hasOwnProperty(segment)) {
            acc[segment] = new Set()
        }

        acc[segment].add(key)

        return acc
    }
}

export const bucketReducer = (keyExtractor) => {
    return (acc, item) => {
        const key = keyExtractor(item)

        if (!acc.hasOwnProperty(key)) {
            acc[key] = 0
        }

        acc[key]++

        return acc
    }
}

export const getBucketKeys = (bucket) =>
    Object.keys(bucket)
        .sort((a, b) => bucket[b] - bucket[a])

export const toChartData = (bucket) =>
    Object
        .keys(bucket)
        .map((key) => ({
            seg: key,
            ...bucket[key]
        }))

export const toPieData = (bucket) =>
    getBucketKeys(bucket)
        .map((key) => ({
            name: key,
            value: bucket[key]
        }))

export const getEventInputProp = (event) => {
    let propName
    switch(event.type) {
        case 'search': {
            propName = 'query'
            break
        }
        case 'no_results': {
            propName = 'query'
            break
        }
        case 'top': {
            propName = 'query'
            break
        }
        case 'lib': {
            propName = 'title'
            break
        }
        case 'start' : {
            propName = 'startPayload'
            break
        }
        default: return
    }

    return {
        name: propName,
        value: event[propName]
    }
}

export const isToday = (date) => {
    console.log(date);
    const today = new Date()
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
}