import React from 'react'
import { render } from 'react-dom'
import store from 'store'

import App from './App'
import playerStore from './store/player-store'

const urlParams = new URLSearchParams(window.location.search)
const provider = urlParams.get('provider') || store.get('lastProvider')
const id = urlParams.get('id') || store.get('lastId')

function renderError(e) {
    if (e) console.error(e)
    document.querySelector('#app .loader').textContent = 'Can`t load playlist'
}

if (provider && id) {
    store.set('lastProvider', provider)
    store.set('lastId', id)

    fetch(`${window.API_BASE_URL}/trackers/${provider}/items/${encodeURIComponent(id)}`)
        .then((response) => response.json())
        .catch((e) => renderError(e))
        .then((playlist) => {
            if (playlist && playlist.files && playlist.files.length) {
                const fileIndex = parseInt(urlParams.get('file'))
                const time = parseFloat(urlParams.get('time'))

                playerStore.openPlaylist({ id, provider, ...playlist }, fileIndex, time)
                render((<App />), document.getElementById('app'))
            } else {
                renderError()
            }
        })
} else {
    renderError()
}


