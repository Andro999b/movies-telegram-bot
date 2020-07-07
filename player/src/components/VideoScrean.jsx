import React from 'react'
import ReactResizeDetector from 'react-resize-detector'
import { observer } from 'mobx-react'
import Hls from 'hls.js'
import BaseScrean from './BaseScrean'
import { createExtractorUrlBuilder } from '../utils'
import logger from '../utils/logger'
import analytics from '../utils/analytics'
import localization from '../localization'

@observer
class VideoScrean extends BaseScrean {
    constructor(props, context) {
        super(props, context)

        this.state = {
            videoScale: 'hor'
        }
    }

    /**
     * lifecycle
     */
    componentDidMount() {
        super.componentDidMount()
        this.initVideo()
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        this.disposeHls()
    }

    /**
     *  reaction
     */

    onPlayPause(isPlaying) {
        if (isPlaying) {
            this.video.play()
        } else {
            this.video.pause()
        }
    }

    onSeek(seekTo) {
        this.video.currentTime = seekTo
    }

    onMute(isMuted) {
        this.video.muted = isMuted
    }

    onVolume(volume) {
        this.video.volume = volume
    }

    onSource() {
        this.initVideo()
    }

    onQuality() {
        if (!this.hls) {
            this.startNativeVideo()
            this.restoreVideoState()
        }
    }

    onAudioTrack(trackId) {
        if (this.hls) {
            this.hls.audioTrack = trackId
        } else {
            this.startNativeVideo()
            this.restoreVideoState()
        }
    }

    disposeHls() {
        if (this.hls) {
            this.hls.stopLoad()
            this.hls.detachMedia()
            this.hls.destroy()
        }
        this.hlsMode = false
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval)
        }
    }

    restoreVideoState = () => {
        const { video, props: { device } } = this

        video.currentTime = device.currentTime
        video.muted = device.isMuted
        video.volume = device.volume

        if (device.isPlaying) {
            video.play()
        } else {
            video.pause()
        }
    }

    initVideo() {
        const { props: { device: { source: { manifestUrl, urls } } } } = this

        this.disposeHls()

        if (urls) {
            this.startNativeVideo()
        } else if (manifestUrl) {
            this.startHlsVideo()
        } else {
            const { device } = this.props

            device.setLoading(false)
            device.setError(localization.cantPlayMedia)
            this.logError('No suitable video source')
            return
        }

        this.restoreVideoState()
    }

    startNativeVideo() {
        const { device: { source: { urls }, audioTrack } } = this.props
        let videoUrls

        if(audioTrack) {
            videoUrls = urls.filter((it) => it.audio == audioTrack)
            if(videoUrls.length == 0) {
                videoUrls = urls
            }
        } else {
            videoUrls = urls
        }

        this.videoUrls = [].concat(videoUrls)

        this.setNativeVideoUrl(this.videoUrls.shift())
    }

    setNativeVideoUrl({ url, extractor }) {
        if (url.startsWith('//')) url = 'http:' + url

        if (extractor) {
            this.video.src = createExtractorUrlBuilder(extractor)(url)
        } else {
            this.video.src = url
        }
    }

    startHlsVideo(manifestUrl) {
        this.hlsMode = true

        const { props: { device } } = this
        const { source: { manifestExtractor } } = device

        manifestUrl = manifestUrl || device.source.manifestUrl

        const hls = new Hls({
            startPosition: device.currentTime,
            xhrSetup: (xhr) => {
                xhr.timeout = 0
            }
        })

        hls.attachMedia(this.video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            this.restoreVideoState()

            if (hls.audioTracks && hls.audioTracks.length > 1) {
                device.setAudioTracks(
                    hls.audioTracks.map(({ id, name }) => ({ id, name }))
                )
            }
        })
        hls.on(Hls.Events.ERROR, this.handleHLSError)

        if (manifestExtractor) {
            hls.loadSource(createExtractorUrlBuilder(manifestExtractor)(manifestUrl))
        } else {
            hls.loadSource(manifestUrl)
        }

        this.hls = hls
    }

    isHlsAvaliable() {
        const { props: { device: { source } } } = this

        return source.manifestUrl && Hls.isSupported()
    }

    /**
     * event handlers
     */

    handleLoadStart = () => {
        const { device } = this.props
        device.setLoading(true)
        device.setError(null)
    }

    handleHLSError = (_, data) => {
        if (data.fatal) {
            switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    // try to recover network error
                    console.log('fatal network error encountered, try to recover') // eslint-disable-line
                    this.hls.startLoad()
                    break
                case Hls.ErrorTypes.MEDIA_ERROR:
                    console.log('fatal media error encountered, try to recover') // eslint-disable-line
                    this.hls.recoverMediaError()
                    break
                default:
                    // cannot recover
                    this.props.device.setError(localization.cantPlayMedia)
                    this.hls.destroy()
                    this.logError(data)
                    break
            }
        }
    }

    handleError = () => {
        const { props: { device }, videoUrls } = this


        let code
        let retry = false

        switch (this.video.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
                code = 'MEDIA_ERR_ABORTED'
                break
            case MediaError.MEDIA_ERR_NETWORK:
                code = 'MEDIA_ERR_NETWORK'
                retry = true
                break
            case MediaError.MEDIA_ERR_DECODE:
                code = 'MEDIA_ERR_DECODE'
                retry = true
                break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                code = 'MEDIA_ERR_SRC_NOT_SUPPORTED'
                break
        }

        console.log(code, retry);

        //retry
        if (retry) {
            this.errorRetries--
            if (this.errorRetries > 0) {
                console.log('Do retry on error') // eslint-disable-line 
                setTimeout(() => {
                    this.restoreVideoState()
                }, 1)
                return
            }
        }

        //try another urls
        if (videoUrls && videoUrls.length > 0) {
            setTimeout(() => {
                this.setNativeVideoUrl(this.videoUrls.shift())
                this.restoreVideoState()
            }, 1)
            return
        }

        //try hls
        if (!this.hlsMode && this.isHlsAvaliable()) { // retry with hls
            this.startHlsVideo()
            return
        }

        device.setError(localization.cantPlayMedia)
        device.setLoading(false)

        this.logError({
            code,
            message: this.video.error.message,
            videoSrc: this.video.src
        })
    }

    handleLoadedMetadata = () => {
        const { device } = this.props

        this.handleUpdate()
        this.handleResize()

        device.setError(null)
        device.setLoading(false)
    }

    handleResize = () => {
        if (this.container) {
            this.video.className = `scale_${this.getVideoScale()}`
        }
    }

    handleWaiting = () => {
        const { device } = this.props
        device.setLoading(true)
    }

    handlePlay = () => {
        const { device } = this.props
        device.setLoading(false)
    }

    handleUpdate = () => {
        const { device } = this.props
        const { video: { buffered, duration, currentTime } } = this

        device.onUpdate({
            duration,
            buffered: buffered.length > 0 ? buffered.end(buffered.length - 1) : 0,
            currentTime
        })
    }

    handleEnded = () => {
        const { device, onEnded } = this.props

        device.pause()
        onEnded()
    }

    getVideoScale() {
        const originAspectRatio = this.video.videoWidth / this.video.videoHeight
        const containerAspectRatio = this.container.clientWidth / this.container.clientHeight

        if (originAspectRatio < containerAspectRatio)
            return 'vert'

        return 'hor'
    }

    logError(errorData) {
        const { props: { device: { source } } } = this

        logger.error('Can`t play media', {
            title: document.title,
            url: location.href,
            source: source,
            details: errorData,
        })

        analytics('play', 'error', 'Can`t play media')
    }

    render() {
        return (
            <div className="player__player-screen" ref={(el) => this.container = el}>
                <ReactResizeDetector
                    skipOnMount
                    handleWidth
                    handleHeight
                    onResize={this.handleResize}
                />
                <video
                    ref={(el) => this.video = el}
                    onDurationChange={this.handleUpdate}
                    onProgress={this.handleUpdate}
                    onTimeUpdate={this.handleUpdate}
                    onLoadedMetadata={this.handleLoadedMetadata}
                    onEnded={this.handleEnded}
                    onLoadStart={this.handleLoadStart}
                    onWaiting={this.handleWaiting}
                    onPlaying={this.handlePlay}
                    onError={this.handleError}
                />
            </div>
        )
    }
}

export default VideoScrean