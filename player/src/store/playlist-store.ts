import { observable, action, makeObservable } from 'mobx'
import * as Sentry from '@sentry/react'

import analytics from '../utils/analytics'
import logger from '../utils/logger'
import localization from '../localization'
import { Playlist } from '../types'

interface LoadPlaylistParams {
  id: string
  provider: string
  query: string | null
}

class PlaylistStore {

  @observable loading = true
  @observable trailerUrl: string | null
  @observable playlist: Playlist
  @observable error: string | null

  abortController: AbortController | null = null

  cache: Record<string, Playlist> = {}

  constructor() {
    makeObservable(this)
  }

  @action.bound loadPlaylist({ provider, id, query }: LoadPlaylistParams): void {
    this.error = null

    const cacheKey = `${provider}#${id}`
    if (this.cache[cacheKey]) {
      this.playlist = this.cache[cacheKey]
      return
    }

    this.loading = true

    if (this.abortController) this.abortController.abort()

    this.abortController = window.AbortController && new AbortController()

    fetch(
      // @ts-ignore
      `${window.API_BASE_URL}/trackers/${provider}/items/${encodeURIComponent(id)}`,
      { signal: this.abortController && this.abortController.signal }
    )
      .then((response) => response.json())
      .then(action((playlist): void => {
        if (playlist.files && playlist.files.length) {
          this.playlist = { id, provider, query, ...playlist }
          this.cache[cacheKey] = this.playlist
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
          const error = playlist.errorDetail || localization.videoNotFound
          this.trackError(provider, id, null, error)
          this.error = error
        }
        this.loading = false
      }))
      .catch(action((e) => {
        Sentry.captureEvent(e)
        if (e.name != 'AbortError') {
          this.error = e.message
          this.loading = false
          this.trackError(provider, id, e, e.message)
        }
      }))
  }

  trackError(provider: string, id: string, err: string | null, message: string): void {
    analytics('error_load')
    logger.error(message, {
      provider,
      id,
      href: location.href,
      err
    })
  }

}

export default PlaylistStore
