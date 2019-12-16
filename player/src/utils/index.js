import groupBy from 'lodash.groupby'

export function createExtractorUrlBuilder(extractor, additionalParams) {
    let extractorBaseUrl = null
    const { type, params } = extractor
    extractorBaseUrl = `${window.API_BASE_URL}/extract?`
    extractorBaseUrl += `type=${type}`

    const finalParams = {...params, ...additionalParams}

    Object.keys(finalParams).forEach((key) => 
        extractorBaseUrl += `&${key}=${finalParams[key]}`
    )

    return (url) => {
        return `${extractorBaseUrl}&url=${encodeURIComponent(url)}`
    }
}

export function invokeAll() {
    const invockes = Array.from(arguments)
    return function () {
        invockes.forEach((invoke) => {
            invoke.call()
        })
    }
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

export function toHHMMSS(timestamp) {
    if(isNaN(timestamp)) return ''

    var hours   = Math.floor(timestamp / 3600)
    var minutes = Math.floor((timestamp - (hours * 3600)) / 60)
    var seconds = Math.floor(timestamp - (hours * 3600) - (minutes * 60))

    if (hours   < 10) {
        hours   = '0' + hours
    }
    if (minutes < 10) {
        minutes = '0' + minutes
    }
    if (seconds < 10) {
        seconds = '0' + seconds
    }
    return hours+':'+minutes+':'+seconds
}