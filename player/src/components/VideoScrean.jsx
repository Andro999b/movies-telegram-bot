import React from 'react'
import ReactResizeDetector from 'react-resize-detector'
import { observer } from 'mobx-react'
import Hls from 'hls.js'
import BaseScrean from './BaseScrean'
import { createExtractorUrlBuilder } from '../utils'

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
        if(!this.hls) {
            this.startNativeVideo()
            this.restoreVideoState()
        }
    }

    onAudioTrack(trackId) {
        if (this.hls) {
            this.hls.audioTrack = trackId
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
        const {
            props: {
                device: {
                    source: {
                        browserUrl,
                        url,
                        manifestUrl
                    }
                }
            }
        } = this

        const { video } = this

        this.disposeHls()

        if (browserUrl) {
            video.src = browserUrl
        } else if (url) {
            if(url.endsWith('m3u8')) {
                this.startHlsVideo(url)
            } else {
                this.startNativeVideo()
            }
        } else if (manifestUrl) {
            this.startHlsVideo()
        } else {
            const { device } = this.props

            device.setLoading(false)
            device.setError('No suitable video source')
            return
        }

        this.restoreVideoState()
    }

    startNativeVideo() {
        const {
            props: {
                device: {
                    source: {
                        url,
                        extractor,
                        alternativeUrls,
                        qualityUrls
                    },
                    quality
                }
            }
        } = this

        const { video } = this
        let targetUrl = url

        if(quality && qualityUrls[quality]) {
            targetUrl = qualityUrls[quality]
            this.alternativeUrls = alternativeUrls
                .concat(url)
                .filter((it) => it != targetUrl)
        } else {
            this.alternativeUrls = alternativeUrls
        }        

        if(targetUrl.startsWith('//')) targetUrl = 'http:' + targetUrl

        if (extractor) {
            video.src = createExtractorUrlBuilder(extractor)(targetUrl)
        } else {
            video.src = targetUrl
        }
    }

    startHlsVideo(manifestUrl) {
        this.hlsMode = true

        const { props: { device } } = this
        const { source: { extractor } } = device

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
        hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        // try to recover network error
                        console.log('fatal network error encountered, try to recover') // eslint-disable-line
                        hls.startLoad()
                        break
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.log('fatal media error encountered, try to recover') // eslint-disable-line
                        hls.recoverMediaError()
                        break
                    default:
                        // cannot recover
                        device.setError('Can`t play media')
                        hls.destroy()
                        break
                }
            }
        })

        if (extractor) {
            hls.loadSource(createExtractorUrlBuilder(extractor)(manifestUrl))
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

    handleError = () => {
        const { props: { device }, alternativeUrls } = this

        if (alternativeUrls && alternativeUrls.length > 0) {
            this.video.src = alternativeUrls.pop()
            this.restoreVideoState()
            return
        }

        if (!this.hlsMode && this.isHlsAvaliable()) { // retry with hls
            this.startHlsVideo()
            return
        }

        device.setError('Could not play media')
        device.setLoading(false)
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