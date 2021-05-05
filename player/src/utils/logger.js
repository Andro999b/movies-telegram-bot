function log(level, message, data) {
    console.error(level, message, data)

    const browser = `${navigator.userAgent}`

    if (process.env.NODE_ENV == 'production') {
        fetch(`${window.API_BASE_URL}/log`, {
            method: 'POST',
            credentials: 'same-origin',
            cache: 'no-cache',
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify({
                level,
                message,
                data: { ...data, browser }
            })
        })
    } else {
        fetch('/log', {
            method: 'POST',
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
        log('ERROR', message, data)
    },
    info: (message, data) => {
        log('INFO', message, data)
    }
}