import { observable, action, makeObservable } from 'mobx'
import analytics from '../utils/analytics'
import store from '../utils/storage'
import logger from '../utils/logger'
import localization from '../localization'
import { watchHistoryStore } from '.'
import { AudioTrack, Playlist, File, Source } from '../types'
import { PlayMode } from '../types/PlayMode'

const END_FILE_TIME_OFFSET = 60

interface OnUpdateParams {
  duration?: number
  buffered?: TimeRanges
  currentTime?: number
}

export class Device {
  @observable playlist!: Playlist
  @observable currentFileIndex = 0
  @observable currentTime = 0
  @observable duration = 0
  @observable buffered: TimeRanges | null = null
  @observable isPlaying = false
  @observable isLoading = false
  @observable error: string | null = null
  @observable volume = 1
  @observable isMuted = false
  @observable audioTracks: AudioTrack[] = []
  @observable audioTrack: string | null = null
  @observable playMode: PlayMode = 'normal'
  @observable autoPlay = true
  @observable seekTime: number | null = null
  @observable quality: number | null = null
  @observable qualities: number[] = []
  @observable seekTo: number | null = null
  @observable source: Source | null = null

  constructor() {
    makeObservable(this)

    this.volume = store.get('volume', 1)
    this.quality = store.get('quality')
    this.playMode = store.get('playMode', 'normal')
    this.autoPlay = store.get('autoPlay', true)
  }

  @action.bound play(currentTime: number | null = null): void {
    this.isPlaying = true
    if (currentTime !== null && !isNaN(currentTime)) {
      this.currentTime = currentTime
      this.seekTo = currentTime
    }
    this.seekTime = null
  }

  @action.bound async setSource(source: Source): Promise<void> {
    const selectedAudioTrack =
      await watchHistoryStore.audioTrack(this.playlist) ?? this.playlist.defaultAudio

    this.currentTime = source.currentTime || 0
    this.seekTo = null
    this.duration = 0
    this.buffered = null
    this.audioTrack = null
    this.audioTracks = []
    this.source = source

    if (source.urls) {
      this.qualities = Array.from(
        new Set(source.urls.map((it) => it.quality).filter((it) => it))
      ) as number[]

      this.audioTracks = Array.from(
        new Set(source.urls
          .map((it) => it.audio)
          .filter((it) => it)
        )
      )
        .map((it) => ({ id: it, name: it })) as AudioTrack[]

      if (this.audioTracks.length > 0) {
        if (selectedAudioTrack) {
          const audioTrack = this.audioTracks.find(({ id }) => id == selectedAudioTrack)
          if (audioTrack) {
            this.audioTrack = audioTrack.id
          } else {
            this.audioTrack = this.audioTracks[0].id
          }
        }
      }
    }
  }

  @action.bound seek(seekTo: number): void {
    this.seekTo = seekTo
    this.seekTime = null
  }

  @action.bound resume(): void {
    this.isPlaying = true
    this.seekTime = null
  }

  @action.bound pause(): void {
    this.isPlaying = false
  }

  @action.bound onUpdate({ duration, buffered, currentTime }: OnUpdateParams): void {
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

  @action.bound async setPlaylist(playlist: Playlist, fileIndex: number | null, startTime: number | null): Promise<void> {
    this.playlist = playlist
    await this.selectFile(fileIndex ?? 0)
    this.play(startTime)
  }

  @action.bound async selectFile(fileIndex: number): Promise<void> {
    const { files } = this.playlist

    if (fileIndex < 0 || fileIndex >= files.length)
      return

    this.setError(null)

    this.currentFileIndex = fileIndex

    const file: File = files[this.currentFileIndex]

    if (file.asyncSource) {
      this.setLoading(true)
      this.source = null

      const { provider, id } = this.playlist
      let sourceId: string, params: Record<string, unknown> = {}, sourceParams: string

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
      const source = await res.json() as File

      try {
        if (fileIndex == this.currentFileIndex) {
          Object.keys(source).forEach((key: string) => {
            // @ts-ignore
            if (source[key]) {
              // @ts-ignore
              file[key] = source[key]
            }
          })
          file.asyncSource = null
          await this.setSource(file as Source)
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
      await this.setSource(file as Source)
    }
  }

  @action.bound setLoading(loading: boolean): void {
    this.isLoading = loading
  }

  @action.bound setError(error: string | null): void {
    this.error = error
  }

  @action.bound setVolume(volume: number): void {
    this.volume = volume
    store.set('volume', volume)
  }

  @action.bound setAudioTrack(id: string): void {
    this.audioTrack = id
    this.setError(null)
    watchHistoryStore.updateAudioTrack(this.playlist, id)
  }

  @action.bound toggleMute(): void {
    this.isMuted = !this.isMuted
  }

  @action.bound setMute(mute: boolean): void {
    this.isMuted = mute
  }

  @action.bound setAutoPlay(autoPlay: boolean): void {
    this.autoPlay = autoPlay
    store.set('autoPlay', autoPlay)
  }

  @action.bound seeking(seekTime: number): void {
    if (seekTime < 0) seekTime = 0
    else if (seekTime > this.duration) seekTime = this.duration
    this.seekTime = seekTime
  }

  @action.bound setQuality(quality: number | null): void {
    this.quality = quality
    store.set('quality', quality)
    this.setError(null)
  }

  @action.bound setPlayMode(playMode: PlayMode): void {
    this.playMode = playMode
    store.set('playMode', playMode)
  }

  @action.bound skip(sec: number): void {
    if (this.duration) {
      const seekTo = this.currentTime + sec
      this.seek(Math.min(Math.max(seekTo, 0), this.duration))
    }
  }
}

class PlayerStore {
  @observable device!: Device

  constructor() {
    makeObservable(this)
  }

  @action.bound async openPlaylist(
    playlist: Playlist,
    fileIndex: number | null,
    startTime: number | null
  ): Promise<void> {
    this.device = new Device()

    let p
    if (fileIndex == null || isNaN(fileIndex)) {
      p = await watchHistoryStore.lastEpisode(playlist)
    } else {
      p = { fileIndex, startTime }
    }

    await this.device.setPlaylist(playlist, p.fileIndex, p.startTime)

    analytics('select_file')
  }

  @action.bound async switchFile(fileIndex: number): Promise<void> {
    await this.device.selectFile(fileIndex)
    const item = await watchHistoryStore.getHistoryItem(this.device.playlist)

    this.device.play(item?.startTime ?? 0)

    analytics('select_file')
    await watchHistoryStore.updateLastFile(this.device.playlist, fileIndex)
  }

  @action.bound prevFile(): void {
    this.switchFile(this.device.currentFileIndex - 1)
  }

  @action.bound fileEnd(): void {
    const { playlist, autoPlay } = this.device



    if (!autoPlay) {
      this.device.pause()
    } else if (playlist.files.length > 1) {
      this.switchFileOrShuffle(this.device.currentFileIndex + 1)
    }
  }

  @action.bound nextFile(): void {
    this.switchFileOrShuffle(this.device.currentFileIndex + 1)
  }

  @action.bound switchFileOrShuffle(fileIndex: number): void {
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

  getPlayerTitle(): string {
    const {
      playlist: { title, files },
      currentFileIndex
    } = this.device

    let res = title

    if (files.length > 1) {
      const file = files[currentFileIndex]
      let currentPath = file.path?.split('/') ?? []
      currentPath = currentPath.concat(file.name)

      res += ' - ' + currentPath.join(' / ')
    }

    return res
  }
}

export default PlayerStore
