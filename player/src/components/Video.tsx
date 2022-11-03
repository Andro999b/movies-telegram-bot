import React, { useEffect, useMemo, useRef, useState } from 'react'

import { createExtractorUrlBuilder } from '../utils/extract'
import { handleSpecialHLSUrls } from '../utils/extract'
import ReactResizeDetector from 'react-resize-detector'

import { observer } from 'mobx-react-lite'
import localization from '../localization'
import logger from '../utils/logger'
import analytics from '../utils/analytics'
import { toJS } from 'mobx'
import { Source } from '../types'
import { Device } from '../store/player-store'

interface Props {
  device: Device,
  onEnded: () => void
}

const logError = (errorData: unknown, source: Source | null): void => {
  logger.error('Can`t play media', {
    title: document.title,
    url: location.href,
    source: toJS(source),
    details: errorData,
  })
}

const Video: React.FC<Props> = ({ device, onEnded }) => {
  const { audioTrack, quality, seekTo, volume, isMuted, isPlaying, playMode } = device
  const source = device.source!
  const container = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)

  const [videoReady, setVideoReady] = useState(false)
  const [fileIndex, setFileIndex] = useState(0)
  const videoFiles = useMemo(() => {
    const { urls } = source
    return urls
      .filter((it) => !audioTrack || it.audio == audioTrack)
      .filter((it) => !quality || it.quality == quality)
  }, [source, audioTrack, quality])
  useEffect(() => setFileIndex(0), [source, audioTrack, quality])
  const tryNextVideo = (): void => setFileIndex((i) => i + 1)

  const videoFile = videoFiles[fileIndex]

  useEffect(() => {
    video.current!.volume = volume
  }, [volume])

  const handleResize = (): void => {
    const currentVideo = video.current
    const currentContainer = container.current
    if (currentVideo && currentContainer) {
      const originAspectRatio = currentVideo.videoWidth / currentVideo.videoHeight
      const containerAspectRatio = currentContainer.clientWidth / currentContainer.clientHeight

      let scale = 'hor'
      if (originAspectRatio < containerAspectRatio)
        scale = 'vert'

      currentVideo.className = `scale_${scale}`
    }
  }

  useEffect(() => {
    setVideoReady(false)

    if (!videoFile) {
      device.setError(localization.cantPlayMedia)
      analytics('error_playback')

      const currentVideo = video.current
      logError({
        code: currentVideo?.error?.code,
        message: currentVideo?.error?.message,
        videoSrc: currentVideo?.src
      }, source)

      return
    }

    let hlsDestory: () => void | null
    const currentVideo = video.current!

    const handleCanPlayThrough = async (): Promise<void> => {
      currentVideo.currentTime = device.seekTo || device.currentTime

      if (device.isPlaying) {
        try {
          await currentVideo.play()
        } catch (e) {
          console.error('Play error:', e)
          device.pause()
        }
      } else {
        currentVideo.pause()
      }
      currentVideo.removeEventListener('canplaythrough', handleCanPlayThrough)
    }
    const startVideo = async (): Promise<void> => {
      setVideoReady(true)
      device.setLoading(true)

      const { extractor } = videoFile
      let { url } = videoFile
      const isHls = videoFile.hls || url.endsWith('m3u8')

      if (extractor) {
        url = await createExtractorUrlBuilder(extractor)(url)
      }

      currentVideo.addEventListener('canplaythrough', handleCanPlayThrough)

      if (isHls) {
        startHlsVideo(url)
      } else {
        startNativeVideo(url)
      }
    }
    const startNativeVideo = (src: string): void => {
      currentVideo.src = src
    }
    const startHlsVideo = async (src: string): Promise<void> => {
      const module = await import(/* webpackChunkName: "hlsjs" */ 'hls.js')
      const Hls = module.default
      type HlsConfig = typeof Hls.DefaultConfig

      class Loader extends Hls.DefaultConfig.loader {
        constructor(config: HlsConfig) {
          super(config)
          const load = this.load.bind(this)
          this.load = (context, config, callbacks): void => {
            if (!handleSpecialHLSUrls(context, callbacks)) {
              load(context, config, callbacks)
            }
          }
        }
      }

      const hls = new Hls({
        manifestLoadingTimeOut: 30 * 1000,
        manifestLoadingMaxRetry: 3,
        autoStartLoad: true,
        testBandwidth: true,
        startLevel: -1,
        maxBufferLength: 60,
        startPosition: device.seekTo || device.currentTime,
        loader: Loader
      })
      hls.on(Hls.Events.ERROR, (_: unknown, data: { fatal: boolean }) => {
        if (data.fatal) {
          logError(data, device.source)
          tryNextVideo()
        }
      })
      hls.attachMedia(currentVideo)
      hls.loadSource(src)
      hlsDestory = hls.destroy.bind(hls)
    }

    startVideo()

    return () => {
      currentVideo.removeEventListener('canplaythrough', handleCanPlayThrough)
      if (hlsDestory) {
        hlsDestory()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoFile?.url, JSON.stringify(videoFile?.extractor), device, source]) // only care abuot url here

  useEffect(() => {
    if (videoReady && seekTo != null) {
      video.current!.currentTime = seekTo
    }
  }, [videoReady, seekTo])

  useEffect(() => {
    if (videoReady) {
      if (isPlaying) {
        video.current!.play()
      } else {
        video.current!.pause()
      }
    }
  }, [videoReady, isPlaying])

  const handleUpdate = (): void => {
    if (videoReady) {
      const { buffered, duration, currentTime } = video.current!

      device.onUpdate({
        duration,
        buffered,
        currentTime
      })
    }
  }

  const handleLoadedMetadata = (): void => {
    handleResize()
    setVideoReady(true)
  }
  const handlePlaying = (): void => device.setLoading(false)
  const handleWaiting = (): void => device.setLoading(true)
  const handleEnded = (): void => {
    if (playMode == 'repeat') {
      video.current!.currentTime = 0
      video.current!.play()
    } else {
      onEnded()
    }
  }

  return (
    <div className="player__player-screen" ref={container}>
      <ReactResizeDetector
        skipOnMount
        handleWidth
        handleHeight
        onResize={handleResize}
      />
      <video
        ref={video}
        muted={isMuted}
        onEnded={handleEnded}
        onDurationChange={handleUpdate}
        onProgress={handleUpdate}
        onTimeUpdate={handleUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlaying={handlePlaying}
        onWaiting={handleWaiting}
        onError={tryNextVideo}
      />
    </div>
  )
}

export default observer(Video)
