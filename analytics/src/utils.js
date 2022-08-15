import { COLORS } from './constants'

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

        if (!acc[seg]) {
            acc[seg] = { seg }
            chartData.push(acc[seg])
        }

        const segmentBucket = acc[seg]

        if (!segmentBucket[key]) {
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

        if (!acc[seg]) {
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
        if(key) { 
            if (!acc[key]) {
                acc[key] = { key, value: initValue}
                chartData.push(acc[key])
            }

            acc[key].value = valueReducer(acc[key].value, item)
        }

        return { acc, chartData }
    }
}

export const bucketInitState = () => ({ acc: {}, chartData: [] })

export const getBucketKeys = ({ acc }) => {
    if(!acc)
        return []
    else
        return Object.keys(acc)
            .sort((a, b) => acc[b] - acc[a])
}


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

export function isTouchDevice() {
    if('ontouchstart' in document.documentElement) {
        return true
    }
    
    if(window.matchMedia) {
        const isMobile = window.matchMedia('only screen and (max-width: 570px)')
        return isMobile.matches
    }

    return false
}

export function isPwa() {
    return ['fullscreen', 'standalone', 'minimal-ui'].some(
        (displayMode) => window.matchMedia('(display-mode: ' + displayMode + ')').matches
    )
}

function hash32(str) {
    var i, l, hval = 0x811c9dc5

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i)
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)
    }

    return hval >>> 0
}

function hash64(str) {
    var h1 = hash32(str)  // returns 32 bit (as 8 byte hex string)
    return h1 + hash32(h1 + str)  // 64 bit (as 16 byte hex string)
}

export function getColor(name) {
    switch(name) {
        case 'search': return COLORS[Math.floor(COLORS.length / 2)]
        case 'start': return COLORS[COLORS.length - 1]
        case 'no_results': return COLORS[0]
        case 'count': return COLORS[0]
        case 'anime': return COLORS[0]
        case 'films': return COLORS[1]
        case 'ua': return COLORS[2]
        case 'select_file': return COLORS[0]
        case 'playlist_loaded': return COLORS[0] 
        case 'error_playback': return COLORS[COLORS.length - 1]
        case 'error_load': return COLORS[0]
        case 'download_file': return COLORS[5]
        case 'share': return COLORS[8]
        case 'sessions': return COLORS[0]
        case 'mobile': return COLORS[COLORS.length - 1]
        case 'desktop': return COLORS[0]
        case 'tablet': return COLORS[Math.floor(COLORS.length / 2)]
        case 'users': return COLORS[0]
        case 'new_users': return COLORS[COLORS.length - 1]
        default: return COLORS[hash64(name) % COLORS.length]
    }
}

export const isSearchableEvent = ({ type }) => ['search', 'no_results'].includes(type)

export function getBotSearchUrl({ bot, query }) {
    switch(bot) {
        case 'ua':
            bot = 'UAMoviesBot'
            break
        case 'anime': 
            bot = 'anime_tube_bot'
            break 
        default:
            bot = 'MoviesBroBot'
    }

    return `https://t.me/${bot}?start=${encodeURIComponent(base64UrlEncode(query))}`
}

export function base64UrlEncode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(
        encodeURIComponent(str)
            .replace(
                /%([0-9A-F]{2})/g,
                (_, p1) => String.fromCharCode('0x' + p1))
    )
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
}