import React from 'react'
import { render } from 'react-dom'

import App from './App'
import playerStore from './store/player-store'

const urlParams = new URLSearchParams(window.location.search)
const provider = urlParams.get('provider')
const id = urlParams.get('id')

function renderError(e) {
    if(e) console.error(e)
    document.querySelector('#app .loader').textContent = 'Can`t load playlist'
}

if (provider && id) {
    fetch(`${window.API_BASE_URL}/trackers/${provider}/items/${encodeURIComponent(id)}`)
        .then((response) => response.json())
        .then((playlist) => {
            playerStore.openPlaylist({ id, provider, ...playlist })
            render((<App />), document.getElementById('app'))
        })
        .catch(renderError)
} else {
    renderError()
}


