import { observable, action } from 'mobx'

import analytics from '../utils/analytics'
import logger from '../utils/logger'
import localization from '../localization'

class PlaylistStore {

    @observable loading = true
    @observable trailerUrl = null
    @observable playlist = null
    @observable error = null

    abortController = null

    @action.bound loadPlaylist({ provider, id, query }) {
        this.loading = true
        this.trailerUrl = null
        this.playlist = null
        this.error = null

        if (this.abortController) this.abortController.abort()

        this.abortController = window.AbortController && new AbortController()

        fetch(
            `${window.API_BASE_URL}/trackers/${provider}/items/${encodeURIComponent(id)}`, 
            { signal: this.abortController && this.abortController.signal }
        )
            .then((response) => response.json())
            .then((playlist) => {
                if (playlist.files && playlist.files.length) {
                    this.playlist = { id, provider, query, ...playlist }

                    document.title = playlist.title

                    analytics('playlist_loaded')
                } else if (playlist.trailer) {
                    this.trailerUrl = playlist.trailer
                    logger.error('Trailer showed but no video found', {
                        provider,
                        id,
                        href: location.href,
                        trailer: playlist.trailer
                    })
                } else {
                    this.error = playlist.errorDetail || localization.videoNotFound
                    this.trackError(provider, id, null, this.error)
                }
                this.loading = false
            })
            .catch((e) => {
                if (e.name != 'AbortError') {
                    this.error = e.message
                    this.loading = false
                    this.trackError(provider, id, e, e.message)
                }
            })
    }

    trackError(provider, id, err, message) {
        analytics('error_load')
        logger.error(message, {
            provider,
            id,
            href: location.href,
            err
        })
    }

}

export default new PlaylistStore()