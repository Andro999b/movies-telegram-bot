import { observable, action } from 'mobx'

import { getPlaylistPrefix } from '../utils'
import analytics from '../utils/analytics'
import store from '../utils/storage'
import logger from '../utils/logger'
import localization from '../localization'

const END_FILE_TIME_OFFSET = 60

export class Device {
    @observable playlist = { name: '', files: [] }
    @observable currentFileIndex = 0
    @observable currentTime = 0
    @observable duration = 0
    @observable buffered = 0
    @observable isPlaying = false
    @observable isLoading = false
    @observable error = null
    @observable volume = 1
    @observable isMuted = false
    @observable audioTracks = []
    @observable audioTrack = null
    @observable shuffle = false
    @observable seekTime = null
    @observable quality = null
    @observable qualities = []

    isLocal() {
        return true
    }

    /* eslint-disable no-unused-vars */
    resume() { }
    pause() { }
    play(currentTime) { }
    seek(currentTime) { }
    disconnect() { }
    setVolume(volume) { }
    selectFile(fileIndex) { }
    setPlaylist(playlist, fileIndex, marks) { }
    setAudioTrack(id) { }
    setAudioTracks(audioTracks) { }
    /* eslint-enable */

    @action.bound seeking(seekTime) {
        this.seekTime = seekTime
    }

    @action.bound setQuality(quality) {
        this.quality = quality
        store.set('quality', quality)
    }

    @action.bound setShuffle(shuffle) {
        this.shuffle = shuffle
        store.set('shuffle', shuffle)
    }

    skip(sec) {
        if (this.duration) {
            const seekTo = this.currentTime + sec
            this.seek(Math.min(Math.max(seekTo, 0), this.duration))
        }
    }
}

export class LocalDevice extends Device {
    @observable seekTo = null
    @observable source = null

    constructor() {
        super()
        this.volume = store.get('volume') || 1
        this.shuffle = store.get('shuffle') || false
    }

    @action.bound play(currentTime) {
        this.isPlaying = true
        if (currentTime !== null && !isNaN(currentTime)) {
            this.currentTime = currentTime
            this.seekTo = currentTime
        }
        this.seekTime = null
    }

    @action.bound setSource(source) {
        this.source = source
        this.currentTime = source.currentTime || 0
        this.duration = 0
        this.buffered = 0
        this.audioTrack = null
        this.audioTracks = []
        this.quality = null

        if (source.urls) {
            this.qualities = Array.from(new Set(
                source.urls
                    .map((it) => it.quality)
                    .filter((it) => it)
            ))

            this.setAudioTracks(
                Array.from(
                    new Set(
                        source.urls
                            .map((it) => it.audio)
                            .filter((it) => it)
                    )
                )
                    .map((it) => ({ id: it, name: it }))
            )
        }
    }

    @action.bound seek(seekTo) {
        this.seekTo = seekTo
        this.seekTime = null
    }

    @action.bound resume() {
        this.isPlaying = true
        this.seekTime = null
    }

    @action.bound pause() {
        this.isPlaying = false
    }

    @action.bound onUpdate({ duration, buffered, currentTime }) {
        if (duration) this.duration = duration
        if (buffered) this.buffered = buffered
        if (currentTime) {
            this.currentTime = currentTime

            if (this.duration) {
                const timeLimit = Math.max(0, this.duration - END_FILE_TIME_OFFSET)
                const mark = Math.min(timeLimit, currentTime)
                store.set(`${getPlaylistPrefix(this.playlist)}:ts`, mark)
            }
        }
    }

    @action.bound setPlaylist(playlist, fileIndex, startTime) {
        this.playlist = playlist
        this.selectFile(fileIndex || 0)
            .then((selected) => {
                if (selected) {
                    this.play(startTime)
                }
            })
    }

    @action.bound selectFile(fileIndex) {
        const { files } = this.playlist

        if (fileIndex < 0 || fileIndex >= files.length)
            return Promise.resolve()

        const playlistPrefix = getPlaylistPrefix(this.playlist)

        store.set(`${playlistPrefix}:current`, fileIndex)

        this.currentFileIndex = fileIndex

        const file = files[this.currentFileIndex]

        if (file.asyncSource) {
            this.setLoading(true)
            this.source = null

            const { provider, id } = this.playlist


            return fetch(`${window.API_BASE_URL}/trackers/${provider}/items/${encodeURIComponent(id)}/source/${file.asyncSource}`)
                .then((res) => res.json())
                .then((source) => {
                    if (fileIndex == this.currentFileIndex) {
                        Object.keys(source).forEach((key) => file[key] = source[key])
                        file.asyncSource = null
                        this.setSource(file)
                    }
                })
                .then(() => true)
                .catch((e) => {
                    logger.error('Can`t load async source', {
                        title: document.title,
                        url: location.href,
                        source: file,
                        errorData: e
                    })

                    analytics('errorPlayback', 'Can`t play media')

                    this.setError(localization.cantPlayMedia)
                    this.setLoading(false)

                    return false
                })
        } else {
            this.setSource(file)
        }

        return Promise.resolve(true)
    }

    @action.bound setLoading(loading) {
        this.isLoading = loading
    }

    @action.bound setError(error) {
        this.error = error
    }

    @action.bound setVolume(volume) {
        this.volume = volume
        store.set('volume', volume)
    }

    @action.bound setAudioTrack(id) {
        this.audioTrack = id
        store.set(`${getPlaylistPrefix(this.playlist)}:audio_track`, id)
    }

    @action.bound setAudioTracks(audioTracks) {
        this.audioTracks = audioTracks

        if (audioTracks.length > 0) {
            const storesAudioTrack = store.get(`${getPlaylistPrefix(this.playlist)}:audio_track`)
            if (storesAudioTrack) {
                const audioTrack = audioTracks.find(({ id }) => id == storesAudioTrack)
                if (audioTrack) {
                    this.audioTrack = audioTrack.id
                } else {
                    this.audioTrack = audioTracks[0].id
                }
            }
        }
    }

    @action.bound toggleMute() {
        this.isMuted = !this.isMuted
    }
}

class PlayerStore {
    @observable device = null

    @action.bound setDevice(device) {
        this.device = device
    }

    @action.bound switchToLocalDevice(callDisconnect = true) {
        this.switchDevice(new LocalDevice(), callDisconnect)
    }

    @action.bound switchDevice(device, callDisconnect = true) {
        const prevDevice = this.device
        const { playlist, currentFileIndex, currentTime } = prevDevice

        if (callDisconnect && prevDevice) prevDevice.disconnect()

        this.device = device
        this.device.setPlaylist(playlist, currentFileIndex, currentTime)
    }

    @action.bound openPlaylist(playlist, fileIndex, startTime) {
        this.device = new LocalDevice()

        if (fileIndex == null || isNaN(fileIndex)) {
            fileIndex = store.get(`${getPlaylistPrefix(playlist)}:current`)

            if (startTime == null || isNaN(startTime)) {
                startTime = parseFloat(store.get(`${getPlaylistPrefix(playlist)}:ts`))
            }
        }

        this.device.setPlaylist(playlist, fileIndex, startTime)
        document.title = this.getPlayerTitle()

        analytics('selectFile', document.title)
    }

    @action.bound switchFile(fileIndex) {
        this.device.selectFile(fileIndex)
            .then((selected) => {
                if (selected) {
                    this.device.play()
                } else {
                    this.device.pause()
                }
                document.title = this.getPlayerTitle()
        
                analytics('selectFile', document.title)
            })
    }

    @action.bound prevFile() {
        this.switchFile(this.device.currentFileIndex - 1)
    }

    @action.bound nextFile() {
        this.switchFileOrShuffle(this.device.currentFileIndex + 1)
    }

    @action.bound switchFileOrShuffle(fileIndex) {
        const { currentFileIndex, shuffle, playlist } = this.device
        const { files } = playlist

        if (files.length > 1 && shuffle) {
            let next

            do {
                next = Math.round(Math.random() * (files.length - 1))
            } while (next == currentFileIndex)

            this.switchFile(next)
        } else {
            this.switchFile(fileIndex)
        }
    }

    getPlayerTitle() {
        const {
            playlist: { title, files },
            currentFileIndex
        } = this.device

        if (title && files) {
            let res = title

            if (files.length > 1) {
                const file = files[currentFileIndex]
                let currentPath = file.path
                currentPath = currentPath ? currentPath.split('/') : []
                currentPath = currentPath.concat(file.name)

                res += ' - ' + currentPath.join(' / ')
            }

            return res
        }
    }
}

export default new PlayerStore()