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
        if (currentTime !== null && !isNaN(currentTime)) {
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

    @action.bound setPlaylist(playlist, fileIndex, startTime) {
        this.playlist = playlist
        this.selectFile(fileIndex || 0)
        this.play(startTime)
        this.isPlaying = false
    }

    @action.bound selectFile(fileIndex) {
        const { files } = this.playlist

        if (fileIndex < 0 || fileIndex >= files.length)
            return

        const playlistPrefix = getPlaylistPrefix(this.playlist)

        localStore.set(`${playlistPrefix}:current`, fileIndex)

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

        const fileIndex = localStore.get(`${getPlaylistPrefix(playlist)}:current`)
        const startTime = parseFloat(localStore.get(`${getPlaylistPrefix(playlist)}:ts`))
        
        this.device.setPlaylist(playlist, fileIndex, startTime)
        document.title = this.getPlayerTitle()
    }

    @action.bound switchFile(fileIndex) {
        this.device.selectFile(fileIndex)
        this.device.play()
        document.title = this.getPlayerTitle()
    }

    @action.bound prevFile() {
        this.switchFile(this.device.currentFileIndex - 1)
    }

    @action.bound nextFile() {
        this.switchFileOrShuffle(this.device.currentFileIndex + 1)
    }

    @action.bound endFile() {
        const  {currentFileIndex, playlist: { files }} = this.device

        if(currentFileIndex == files.length - 1) {
            this.device.pause()
        } else {
            this.switchFileOrShuffle(this.device.currentFileIndex + 1)
        }
    }

    @action.bound switchFileOrShuffle(fileIndex) {
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

        this.device.play()
        document.title = this.getPlayerTitle()
    }

    getPlayerTitle() {
        const {
            playlist: { title, files },
            currentFileIndex
        } = this.device

        if (title && files) {
            const file = files[currentFileIndex]
            return `${title}${files.length > 1 ?  ' - ' + file.name : ''}`
        }
    }
}

export default new PlayerStore()