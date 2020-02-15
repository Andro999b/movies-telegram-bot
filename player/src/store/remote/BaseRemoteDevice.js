import { Device } from '../player-store'
import { action } from 'mobx'
import localStore from 'store'
import { getPlaylistPrefix } from '../../utils'

import pick from 'lodash.pick'

const ALLOWED_REMOTE_STATE_FIELDS = [
    'playlist',
    'currentFileIndex',
    'currentTime',
    'duration',
    'buffered',
    'isPlaying',
    'isLoading',
    'error',
    'volume',
    'isMuted',
    'quality',
    'qualities'
]

export default class BaseRemoteDevice extends Device {
    resume() {
        this.sendAction('resume')
        this.seekTime = null
    }

    pause() {
        this.sendAction('pause')
        this.seekTime = null
    }

    play(currentTime) {
        this.sendAction('play', currentTime)
        if(currentTime != null) {
            this.currentTime = currentTime
            this.seekTime = null
        }
    }

    @action.bound seek(currentTime) {
        this.currentTime = currentTime
        this.seekTime = null
        this.sendAction('seek', currentTime)
    }

    @action.bound setVolume(volume) {
        this.volume = volume
        this.sendAction('setVolume', volume)
    }

    @action.bound setQuality(quality) {
        super.setQuality(quality)
        super.sendAction('setQuality')
    }

    toggleMute() {
        this.sendAction('toggleMute')
    }

    selectFile(fileIndex) {
        const { files } = this.playlist

        if (fileIndex < 0 || fileIndex >= files.length)
            return false

        this.currentFileIndex = fileIndex

        this.sendAction('selectFile', fileIndex)

        return true
    }

    @action.bound setPlaylist(playlist, fileIndex, startTime) {
        this.playlist = playlist
        this.sendAction('setPlaylist', { playlist, fileIndex, startTime })
    }
    
    @action.bound onSync(state) {
        const filteredState = pick(state, ALLOWED_REMOTE_STATE_FIELDS)

        Object.keys(filteredState).forEach((key) => {
            this[key] = state[key]
        })

        // eslint-disable-next-line no-prototype-builtins
        if(filteredState.hasOwnProperty('currentFileIndex')) {
            const playlistPrefix = getPlaylistPrefix(this.playlist)
            localStore.set(`${playlistPrefix}:current`, this.currentFileIndex)
        }
    }
}