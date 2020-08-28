import React from 'react'
import { render } from 'react-dom'

import App from './App'
import playerStore from './store/player-store'
import logger from './utils/logger'
import analytics from './utils/analytics'
import store from './utils/storage'
import { base64UrlEncode } from './utils/base64'
import localization from './localization'

const urlParams = new URLSearchParams(window.location.search)
const provider = urlParams.get('provider') || store.get('provider')
const id = urlParams.get('id') || store.get('id')
const query = urlParams.get('query')

function getAlternativeUrl() {
    let bot
    switch(provider) {
        case 'animevost': 
        case 'nekomori': 
            bot = 'anime_tube_bot'
            break 
        default:
            bot = 'films_search_bot'
    }

    return `https://t.me/${bot}?start=${encodeURIComponent(base64UrlEncode(query))}`
}

function renderError(message, err) {
    message = message || localization.cantLoadPLaylist

    if(query) {
        document.querySelector('#app .loader').innerHTML = localization.formatString(
            localization.searchAlternatives, 
            message,
            getAlternativeUrl()
        )
        document.getElementById('altenativeLink').addEventListener('click', () => {
            analytics('alternativeLink', query)
        })
    } else {
        document.querySelector('#app .loader').textContent = message
    }
    

    analytics('errorLoad', message)
    logger.error(message, {
        provider,
        id,
        href: location.href,
        err
    })
}

function trailerRedirect(trailerUrl) {
    analytics('rediectTrailer', trailerUrl)
    location.href = trailerUrl
}

export default function () {
    if (window.gtag) {
        gtag('js', new Date())
        gtag('config', 'UA-153629378-1')
    }

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

                    analytics('playlistLoaded', document.title)
                    
                    render((<App />), document.getElementById('app'))
                } else if(playlist && playlist.trailer) {
                    trailerRedirect(playlist.trailer)
                } else {
                    renderError(localization.videoNotFound)
                }
            })
            .catch((e) => renderError(null, { message: e.message }))
    } else {
        renderError()
    }
}