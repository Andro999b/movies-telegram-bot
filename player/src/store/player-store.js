import { observable, action } from 'mobx'
import localStore from 'store'

const END_FILE_TIME_OFFSET = 60
const getPlaylistPrefix = (playlist) => `playlist:${playlist.provider}:${playlist.id}`

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
    
    isLocal() {
        return true
    }

    /* eslint-disable no-unused-vars */
    resume() { }
    pause() { }
    play(currentTime) { }
    seek(currentTime) { }
    connect() { }
    disconnect() { }
    setVolume(volume) { }
    selectFile(fileIndex) { }
    setPlaylist(playlist, fileIndex, marks) { }
    setShuffle(shuffle) { }
    setAudioTrack(id) { }
    setAudioTracks(audioTracks) { }
    /* eslint-enable */

    @action.bound seeking(seekTime) {
        this.seekTime = seekTime
    }

    skip(sec) {
        if (this.duration) {
            const seekTo = this.currentTime + sec
            this.seek(Math.min(Math.max(seekTo, 0), this.duration))
        }
    }
}

export class LocalDevice extends Device {
    @observable url = null
    @observable seekTo = null
    @observable source = null
    @observable progress = null

    constructor() {
        super()
        this.volume = localStore.get('volume') || 1
        this.shuffle = localStore.get('shuffle') || false
    }

    @action.bound setSource(source) {
        this.source = source
        this.currentTime = source.currentTime || 0
        this.duration = 0
        this.buffered = 0
        this.audioTrack = null
        this.audioTracks = []
    }

    @action.bound play(currentTime) {
        this.isPlaying = true
        if (currentTime != undefined) {
            this.currentTime = currentTime
            this.seekTo = currentTime
        }
        this.seekTime = null
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
                localStore.set(`${getPlaylistPrefix(this.playlist)}:ts`, mark)
            }
        }
    }

    @action.bound setPlaylist(playlist) {
        this.playlist = playlist
        this.selectFile(localStore.get(`${getPlaylistPrefix(this.playlist)}:current`) || 0)
        this.play()
        this.isPlaying = false
    }

    @action.bound selectFile(fileIndex) {
        const { files } = this.playlist

        if (fileIndex < 0 || fileIndex >= files.length)
            return

        const playlistPrefix = getPlaylistPrefix(this.playlist)
        const storedIndex = localStore.get(`${playlistPrefix}:current`) || 0
        if(storedIndex != fileIndex) {
            localStore.set(`${playlistPrefix}:current`, fileIndex)
            localStore.set(`${playlistPrefix}:ts`, 0)
        }

        this.currentFileIndex = fileIndex
        this.setSource(files[this.currentFileIndex])
    }

    @action.bound setLoading(loading) {
        this.isLoading = loading
    }

    @action.bound setError(error) {
        this.error = error
    }

    @action.bound setVolume(volume) {
        this.volume = volume
        localStore.set('volume', volume)
    }

    @action.bound setAudioTrack(id) {
        this.audioTrack = id
    }

    @action.bound setAudioTracks(audioTracks) { 
        this.audioTracks = audioTracks 
    }

    @action.bound setShuffle(shuffle) { 
        this.shuffle = shuffle 
        localStore.set('shuffle', shuffle)
    }

    @action.bound toggleMute() {
        this.isMuted = !this.isMuted
    }
}

class PlayerStore {
    @observable device

    @action openPlaylist(playlist) {
        this.device = new LocalDevice()
        this.device.setPlaylist(playlist)
    }

    @action.bound switchFile(fileIndex) {
        const { currentFileIndex, shuffle, playlist } = this.device
        const { files } = playlist

        if(files.length > 1 && shuffle) {
            let next
            
            do{
                next = Math.round(Math.random() * (files.length - 1))
            } while(next == currentFileIndex)
            
            this.device.selectFile(next)
        } else {
            this.device.selectFile(fileIndex)
        }

        const mark = parseFloat(localStore.get(`${getPlaylistPrefix(playlist)}:ts`))
        const currentTime = !isNaN(mark) ? mark : 0 

        this.device.play(currentTime)
    }

    @action.bound prevFile() {
        this.switchFile(this.device.currentFileIndex - 1)
    }

    @action.bound nextFile() {
        this.switchFile(this.device.currentFileIndex + 1)
    }

    @action.bound endFile() {
        const  {currentFileIndex, playlist: { files }} = this.device

        if(currentFileIndex == files.length - 1) {
            this.device.pause()
        } else {
            this.switchFile(this.device.currentFileIndex + 1)
        }
    }

    getPlayerTitle() {
        const {
            playlist: { title, files },
            currentFileIndex
        } = this.device

        if (title && files) {
            return title + (files.length > 1 ? ` - ${currentFileIndex + 1} / ${files.length}` : '')
        }
    }
}

export default new PlayerStore()