import React from 'react'
import { render } from 'react-dom'
import store from 'store'

import App from './App'
import playerStore from './store/player-store'
import logger from './utils/logger'

const urlParams = new URLSearchParams(window.location.search)
const provider = urlParams.get('provider') || store.get('provider')
const id = urlParams.get('id') || store.get('id')


function renderError(message, err) {
    message = message || 'Can`t load playlist'

    document.querySelector('#app .loader').textContent = message

    window.gtag && gtag('event', 'load', {
        'event_category': 'error',
        'event_label': message
    })

    logger.error(message, {
        provider,
        id,
        href: location.href,
        err
    })
}


export default function () {
    if (provider && id) {
        store.set('provider', provider)
        store.set('id', id)

        fetch(`${window.API_BASE_URL}/trackers/${provider}/items/${encodeURIComponent(id)}`)
            .then((response) => response.json())
            .then((playlist) => {
                if (playlist && playlist.files && playlist.files.length) {
                    const fileIndex = parseInt(urlParams.get('file'))
                    const time = parseFloat(urlParams.get('time'))

                    playerStore.openPlaylist({ id, provider, ...playlist }, fileIndex, time)
                    render((<App />), document.getElementById('app'))
                } else {
                    renderError('Video not found')
                }
            })
            .catch((e) => renderError(null, e))
    } else {
        renderError()
    }
}