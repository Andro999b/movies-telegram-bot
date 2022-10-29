import { observable, action, makeObservable } from 'mobx'
import analytics from '../utils/analytics'
import store from '../utils/storage'
import logger from '../utils/logger'
import localization from '../localization'
import { watchHistoryStore } from '.'

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
    @observable playMode = 'normal'
    @observable autoPlay = true
    @observable seekTime = null
    @observable quality = null
    @observable qualities = []
    @observable seekTo = null
    @observable source = null

    constructor() {
      makeObservable(this)
        
      this.volume = store.get('volume', 1)
      this.playMode = store.get('playMode', 'normal')
      this.autoPlay = store.get('autoPlay', true)
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
      this.currentTime = source.currentTime || 0
      this.seekTo = null
      this.duration = 0
      this.buffered = 0
      this.audioTrack = null
      this.audioTracks = []
      this.quality = null
      this.source = source

      if (source.urls) {
        this.qualities = Array.from(new Set(source.urls.map((it) => it.quality).filter((it) => it)))

        this.setAudioTracks(
          Array.from(
            new Set(source.urls.map((it) => it.audio).filter((it) => it))
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
      if (duration !== undefined) this.duration = duration
      if (buffered !== undefined) this.buffered = buffered
      if (currentTime !== undefined) {
        this.currentTime = currentTime
        this.seekTo = null

        if (this.duration) {
          const timeLimit = Math.max(0, this.duration - END_FILE_TIME_OFFSET)
          const mark = Math.min(timeLimit, currentTime)
          watchHistoryStore.updateLastFilePosition(this.playlist, mark)
        }
      }
    }

    @action.bound async setPlaylist(playlist, fileIndex, startTime) {
      this.playlist = playlist
      await this.selectFile(fileIndex || 0)
      this.play(startTime)
    }

    @action.bound async selectFile(fileIndex) {
      const { files } = this.playlist

      if (fileIndex < 0 || fileIndex >= files.length)
        return

      this.setError(null)

      this.currentFileIndex = fileIndex

      const file = files[this.currentFileIndex]

      if (file.asyncSource) {
        this.setLoading(true)
        this.source = null

        const { provider, id } = this.playlist
        let sourceId, params = {}, sourceParams

        if (typeof file.asyncSource === 'string') {
          sourceId = file.asyncSource
        } else {
          sourceId = file.asyncSource.sourceId
          params = file.asyncSource.params
        }

        sourceParams = Object.keys(params)
          .map((key) => `${key}=${params[key]}`)
          .join('&')

        if (!sourceParams) sourceParams = `?${sourceParams}`

        const res = await fetch(`${window.API_BASE_URL}/trackers/${provider}/items/${encodeURIComponent(id)}/source/${sourceId}${sourceParams}`)
        const source = await res.json()

        try {
          if (fileIndex == this.currentFileIndex) {
            Object.keys(source).forEach((key) => file[key] = source[key])
            file.asyncSource = null
            this.setSource(file)
          }
        } catch (e) {
          logger.error('Can`t load async source', {
            title: document.title,
            url: location.href,
            source: file,
            errorData: e
          })

          analytics('error_playback')

          this.setError(localization.cantPlayMedia)
          this.setLoading(false)
        }
      } else {
        this.setSource(file)
      }
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
      this.setError(null)
      watchHistoryStore.updateAudioTrack(this.playlist, id)
    }

    @action.bound async setAudioTracks(audioTracks) {
      this.audioTracks = audioTracks

      if (audioTracks.length > 0) {
        const storedTrack = await watchHistoryStore.audioTrack(this.playlist)
        if (storedTrack) {
          const audioTrack = audioTracks.find(({ id }) => id == storedTrack)
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

    @action.bound setMute(mute) {
      this.isMuted = mute
    }

    @action.bound setAutoPlay(autoPlay) {
      this.autoPlay = autoPlay
      store.set('autoPlay', autoPlay)
    }

    @action.bound seeking(seekTime) {
      if (seekTime < 0) seekTime = 0
      else if (seekTime > this.duration) seekTime = this.duration
      this.seekTime = seekTime
    }

    @action.bound setQuality(quality) {
      this.quality = quality
      store.set('quality', quality)
    }

    @action.bound setPlayMode(playMode) {
      this.playMode = playMode
      store.set('playMode', playMode)
    }

    @action.bound skip(sec) {
      if (this.duration) {
        const seekTo = this.currentTime + sec
        this.seek(Math.min(Math.max(seekTo, 0), this.duration))
      }
    }
}

class PlayerStore {
    @observable device = new Device()

    constructor() {
      makeObservable(this)
    }

    @action.bound async openPlaylist(playlist, fileIndex, startTime) {
      let p
      if (fileIndex == null || isNaN(fileIndex)) {
        p = await watchHistoryStore.lastEpisode(playlist)
      } else {
        p = { fileIndex, startTime }
      }

      this.device.setPlaylist(playlist, p.fileIndex, p.startTime)
      this.device.play()

      analytics('select_file')
    }

    @action.bound async switchFile(fileIndex) {
      await this.device.selectFile(fileIndex)
      const item = await watchHistoryStore.getHistoryItem(this.device.playlist)

      this.device.play(item?.startTime ?? 0)

      analytics('select_file')
      await watchHistoryStore.updateLastFile(this.device.playlist, fileIndex)
    }

    @action.bound prevFile() {
      this.switchFile(this.device.currentFileIndex - 1)
    }

    @action.bound fileEnd() {
      const { playMode, playlist, autoPlay } = this.device

      if (!autoPlay)
        return
      else if (playMode == 'repeat')
        this.device.play(0)
      else if (playlist.files.length > 1)
        this.switchFileOrShuffle(this.device.currentFileIndex + 1)
    }

    @action.bound nextFile() {
      this.switchFileOrShuffle(this.device.currentFileIndex + 1)
    }

    @action.bound switchFileOrShuffle(fileIndex) {
      const { currentFileIndex, playMode, playlist } = this.device
      const { files } = playlist

      if (files.length > 1 && playMode == 'shuffle') {
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

export default PlayerStore
