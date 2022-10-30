import React, { useEffect, useMemo, useRef, useState } from 'react'

import { createExtractorUrlBuilder } from '../utils/extract'
import { handleSpecialHLSUrls } from '../utils/extract'
import ReactResizeDetector from 'react-resize-detector'

import { observer } from 'mobx-react-lite'
import localization from '../localization'
import logger from '../utils/logger'
import analytics from '../utils/analytics'
import { toJS } from 'mobx'

const logError = (errorData) => {
  const { props: { device: { source } } } = this

  logger.error('Can`t play media', {
    title: document.title,
    url: location.href,
    source: toJS(source),
    details: errorData,
  })
}

export default observer(({ device, onEnded }) => {
  const { source, audioTrack, quality, seekTo, volume, isMuted, isPlaying } = device
  const container = useRef()
  const video = useRef()

  const [videoReady, setVideoReady] = useState(false)
  const [fileIndex, setFileIndex] = useState(0)
  const videoFiles = useMemo(() => {
    const { urls } = source
    return urls
      .filter((it) => !audioTrack || it.audio == audioTrack)
      .filter((it) => !quality || it.quality == quality)
  }, [source, audioTrack, quality])
  useEffect(() => setFileIndex(0), [source, audioTrack, quality])
  const tryNextVideo = () => setFileIndex((i) => i + 1)

  const videoFile = videoFiles[fileIndex]

  useEffect(() => {
    video.current.volume = volume
  }, [volume])

  const handleResize = () => {
    if (container.current) {
      const currentVideo = video.current
      const currentContainer = container.current

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
      return
    }

    let hls
    const currentVideo = video.current

    const handleCanPlayThrough = async () => {
      currentVideo.currentTime = device.currentTime

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

      setVideoReady(true)
      currentVideo.removeEventListener('canplaythrough', handleCanPlayThrough)
    }
    const startVideo = async () => {
      setVideoReady(true)
      device.setLoading(true)

      let { extractor, url } = videoFile
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
    const startNativeVideo = (src) => currentVideo.src = src
    const startHlsVideo = (src) => {
      import(/* webpackChunkName: "hlsjs" */ 'hls.js').then((module) => {
        const Hls = module.default

        class Loader extends Hls.DefaultConfig.loader {
          constructor(config) {
            super(config)
            var load = this.load.bind(this)
            this.load = function (context, config, callbacks) {
              if (!handleSpecialHLSUrls(context, callbacks)) {
                load(context, config, callbacks)
              }
            }
          }
        }

        hls = new Hls({
          manifestLoadingTimeOut: 30 * 1000,
          manifestLoadingMaxRetry: 3,
          autoStartLoad: true,
          testBandwidth: true,
          startLevel: -1,
          maxBufferLength: 60,
          startPosition: device.seekTo || device.currentTime,
          xhrSetup: (xhr) => {
            xhr.timeout = 0
          },
          loader: Loader
        })
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            logError(data)
            tryNextVideo()
          }
        })
        hls.attachMedia(currentVideo)
        hls.loadSource(src)
      })
    }

    startVideo()

    return () => {
      currentVideo.removeEventListener('canplaythrough', handleCanPlayThrough)
      if (hls) {
        hls.destroy()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoFile?.url, JSON.stringify(videoFile?.extractor), device, source]) // only care abuot url here

  useEffect(() => {
    if (videoReady && seekTo != null) {
      video.current.currentTime = seekTo
    }
  }, [videoReady, seekTo])

  useEffect(() => {
    if (videoReady) {
      if (isPlaying) {
        video.current.play()
      } else {
        video.current.pause()
      }
    }
  }, [videoReady, isPlaying])

  const handleUpdate = () => {
    if (videoReady) {
      const { buffered, duration, currentTime } = video.current

      device.onUpdate({
        duration,
        buffered: buffered,
        currentTime
      })
    }
  }

  const handlePlaying = () => device.setLoading(false)
  const handleWaiting = () => device.setLoading(true)
  const handleError = () => {
    const currentVideo = video.current
    logError({
      code: currentVideo?.error?.code,
      message: currentVideo?.error?.message,
      videoSrc: currentVideo?.src
    })
    tryNextVideo()
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
        onEnded={onEnded}
        onDurationChange={handleUpdate}
        onProgress={handleUpdate}
        onTimeUpdate={handleUpdate}
        onLoadedMetadata={handleResize}
        onPlaying={handlePlaying}
        onWaiting={handleWaiting}
        onError={handleError}
      />
    </div>
  )
})
