import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { createExtractorUrlBuilder } from '../utils/extract'
import { handleSpecialHLSUrls } from '../utils/extract'
import { useResizeDetector } from 'react-resize-detector'

import { observer } from 'mobx-react-lite'
import localization from '../localization'
import logger from '../utils/logger'
import analytics from '../utils/analytics'
import { toJS } from 'mobx'
import { Source } from '../types'
import { Device } from '../store/player-store'
import { isNativeHSLUserAgent } from '../utils'

import Hls from 'hls.js'

interface Props {
  device: Device;
  onEnded: () => void;
}

const logError = (errorData: unknown, source: Source | null): void => {
  logger.error('Can`t play media', {
    title: document.title,
    url: location.href,
    source: toJS(source),
    details: errorData,
  })
}

export interface VideoApi {
  takeScreanShot: () => string
}

const Video = React.forwardRef<VideoApi, Props>(({ device, onEnded }, ref) => {
  const { audioTrack, quality, seekTo, volume, isMuted, isPlaying, playMode, pip } =
    device
  const source = device.source!
  const video = useRef<HTMLVideoElement>(null)

  const [orientation, setOrientation] = useState('scale_hor')
  const [videoReady, setVideoReady] = useState(false)
  const [fileIndex, setFileIndex] = useState(0)

  useImperativeHandle(ref, () => ({
    takeScreanShot(): string {
      const currentVideo = video.current!

      const canvas = document.createElement('canvas')
      canvas.width = currentVideo.videoWidth
      canvas.height = currentVideo.videoHeight
      canvas.getContext('2d').drawImage(currentVideo, 0, 0)

      return canvas.toDataURL('image/jpeg')
    },
  }), [])

  useEffect(() => {
    video.current!.volume = volume
  }, [volume])

  const videoFiles = useMemo(() => {
    const { urls } = source
    return urls
      .filter((it) => !audioTrack || it.audio == audioTrack)
      .filter((it) => !quality || it.quality <= quality)
  }, [source, audioTrack, quality])

  useEffect(() => setFileIndex(0), [videoFiles])

  useEffect(() => {
    const togglePip = async (): Promise<void> => {
      const currentVideo = video.current
      if ('pictureInPictureEnabled' in document && currentVideo) {
        if (pip) {
          await currentVideo.requestPictureInPicture()
          device.setPip(true)
          const onLeavePictureInPicture = (): void => {
            device.setPip(false)
            currentVideo.removeEventListener('leavepictureinpicture', onLeavePictureInPicture)
          }
          currentVideo.addEventListener('leavepictureinpicture', onLeavePictureInPicture)
        } else {
          if (document.pictureInPictureElement == currentVideo) {
            await document.exitPictureInPicture()
          }
        }
      }
    }
    togglePip()
  }, [device, pip, video])

  const handleResize = useCallback(
    (width: number | undefined, height: number | undefined): void => {
      const currentVideo = video.current
      if (currentVideo && width && height) {
        const originAspectRatio =
          currentVideo.videoWidth / currentVideo.videoHeight
        const containerAspectRatio = width / height

        let scale = 'hor'
        if (originAspectRatio < containerAspectRatio) scale = 'vert'

        setOrientation(`scale_${scale}`)
      }
    },
    []
  )

  const { ref: container } = useResizeDetector({ onResize: handleResize })

  const tryNextVideo = (): void => setFileIndex(fileIndex + 1)

  const videoFile = videoFiles[fileIndex]

  useLayoutEffect(() => {
    setVideoReady(false)

    if (!videoFile) {
      device.setError(localization.cantPlayMedia)
      analytics('error_playback')

      const currentVideo = video.current
      logError(
        {
          code: currentVideo?.error?.code,
          message: currentVideo?.error?.message,
          videoSrc: currentVideo?.src,
        },
        source
      )

      return
    }

    let hlsDestory: () => void | null
    const currentVideo = video.current!

    const startVideo = async (): Promise<void> => {
      device.setLoading(true)

      const { extractor } = videoFile
      let { url } = videoFile
      const isHls = videoFile.hls || url.endsWith('m3u8')

      if (extractor) {
        try {
          url = await createExtractorUrlBuilder(extractor)(url)
        } catch (e) {
          logError(e, source)
          tryNextVideo()
          return
        }
      }

      currentVideo.currentTime = 0
      currentVideo.load()

      if (!isNativeHSLUserAgent() && isHls) {
        startHlsVideo(url)
      } else {
        startNativeVideo(url)
      }
    }

    const startNativeVideo = (src: string): void => {
      currentVideo.src = src
    }

    const startHlsVideo = (src: string): void => {
      type HlsConfig = typeof Hls.DefaultConfig;

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
        loader: Loader,
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
      if (hlsDestory) {
        hlsDestory()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoFile?.url, JSON.stringify(videoFile?.extractor), device, source]) // only care abuot url here

  useLayoutEffect(() => {
    if (videoReady && seekTo != null) {
      video.current!.currentTime = seekTo
    }
  }, [videoReady, seekTo])

  useLayoutEffect(() => {
    if (videoReady) {
      const currentVideo = video.current!
      if (currentVideo.paused == isPlaying) {
        if (isPlaying) {
          currentVideo.play()
        } else {
          currentVideo.pause()
        }
      }
    }
  }, [videoReady, isPlaying])

  const handleUpdate = (): void => {
    if (videoReady) {
      const { buffered, duration, currentTime } = video.current!

      device.onUpdate({
        duration,
        buffered,
        currentTime,
      })
    }
  }

  const handleLoadedMetadata = (): void => {
    handleResize(
      container.current?.clientWidth,
      container.current?.clientHeight
    )
    setVideoReady(true)

    const currentVideo = video.current!
    const resotreVideo = async (): Promise<void> => {
      currentVideo.currentTime = device.seekTo || device.currentTime

      if (isPlaying) {
        try {
          await currentVideo.play()
          analytics('playback_starts')
        } catch (e) {
          console.error('Play error:', e)
          device.setLoading(false)
          device.pause()
          analytics('playback_fails')
        }
      } else {
        currentVideo.pause()
      }
    }
    resotreVideo()
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

  const onPlayPause = (): void => {
    const currentVideo = video.current!
    if (currentVideo.paused == isPlaying) {
      if (currentVideo.paused) {
        device.pause()
      } else {
        device.play()
      }
    }
  }

  return (
    <div className="player__player-screen" ref={container}>
      <video
        playsInline
        preload="auto"
        className={orientation}
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
        onPlay={onPlayPause}
        onPause={onPlayPause}
      />
    </div>
  )
})

export default observer(Video)
