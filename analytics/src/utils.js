export const range = (to) => Array.from({ length: to }, (_, k) => k + 1)

export const getUserName = ({ firstname, lastname, username }) =>
    [firstname, lastname].join(' ') + (username ? ' @' + username : '')

export const segmentBucketReducer = (
    segmentExtractor, 
    keyExtractor, 
    valueReducer = (acc) => acc + 1,
    initValue = 0 
) => {
    return ({ acc ={}, chartData = [] }, item) => {
        const seg = segmentExtractor(item)
        const key = keyExtractor(item)

        if (!key) return

        if (!acc.hasOwnProperty(seg)) {
            acc[seg] = { seg }
            chartData.push(acc[seg])
        }

        const segmentBucket = acc[seg]

        if (!segmentBucket.hasOwnProperty(key)) {
            segmentBucket[key] = initValue
        }

        segmentBucket[key] = valueReducer(segmentBucket[key], item)

        return { acc, chartData }
    }
}

export const uniqueBucketReducer = (segmentExtractor, keyExtractor) => {
    return ({ acc = {}, chartData = [] }, item) => {
        const seg = segmentExtractor(item)
        const key = keyExtractor(item)

        if (!key) return

        if (!acc.hasOwnProperty(seg)) {
            acc[seg] = { seg, value: new Set(), count: 0 }
            chartData.push(acc[seg])
        }

        acc[seg].value.add(key)
        acc[seg].count = acc[seg].value.size

        return { acc, chartData }
    }
}

export const bucketReducer = (
    keyExtractor,
    valueReducer = (acc) => acc + 1,
    initValue = 0 
) => {
    return ({ acc = {}, chartData = [] }, item) => {
        const key = keyExtractor(item)

        if (!acc.hasOwnProperty(key)) {
            acc[key] = { key, value: initValue}
            chartData.push(acc[key])
        }

        acc[key].value = valueReducer(acc[key].value, item)

        return { acc, chartData }
    }
}

export const getBucketKeys = ({ acc }) =>
    Object.keys(acc)
        .sort((a, b) => acc[b] - acc[a])


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
    const today = new Date()
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
}