const TOKEN = 'rOjDKFokkakyfdLplhQfxIPmyLATZKoq'

function log(level, message, data) {
    console.error(level, message, data)

    const browser = `${navigator.userAgent}`

    if (!location.host.startsWith('localhost') && !window.mobileApp) {
        fetch(`https://listener-eu.logz.io:8071/?token=${TOKEN}&type=web`, {
            method: 'POST',
            credentials: 'same-origin',
            cache: 'no-cache',
            mode: 'no-cors',
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify({
                level,
                message,
                data: { ...data, browser }
            })
        })
    }
}

export default {
    error: (message, data) => {
        log('error', message, data)
    },
    info: (message, data) => {
        log('info', message, data)
    }
}