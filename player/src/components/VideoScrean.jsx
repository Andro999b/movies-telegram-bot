import React from 'react'
import ReactResizeDetector from 'react-resize-detector'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import Hls from 'hls.js'
import BaseScrean from './BaseScrean'
import { createExtractorUrlBuilder } from '../utils'
import logger from '../utils/logger'
import analytics from '../utils/analytics'
import localization from '../localization'

@observer
class VideoScrean extends BaseScrean {

    state = { videoScale: 'hor' }
    video = React.createRef()
    container = React.createRef()

    /**
     * lifecycle
     */
    componentDidMount() {
        super.componentDidMount()
        this.initVideo()
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        this.dispose()
    }

    /**
     *  reaction
     */

    onPlayPause(isPlaying) {
        const video = this.video.current
        if (isPlaying) {
            video.play()
        } else {
            video.pause()
        }
    }

    onSeek(seekTo) {
        const video = this.video.current
        video.currentTime = seekTo
    }

    onMute(isMuted) {
        const video = this.video.current
        video.muted = isMuted
    }

    onVolume(volume) {
        const video = this.video.current
        video.volume = volume
    }

    onSource() {
        this.initVideo()
    }

    onQuality() {
        this.startVideo()
    }

    onAudioTrack(trackId) {
        if (this.hlsMultiAudio) {
            this.hls.audioTrack = trackId
        } else {
            this.startVideo()
        }
    }

    dispose() {
        if (this.hls) {
            this.hls.stopLoad()
            this.hls.detachMedia()
            this.hls.destroy()
        }

        const video = this.video.current
        video.removeAttribute('src')
        video.load()
        
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval)
        }
    }

    restoreVideoState = () => {
        const { props: { device } } = this
        const video = this.video.current

        video.currentTime = device.currentTime
        video.muted = device.isMuted
        video.volume = device.volume
        video.load()

        if (device.isPlaying) {
            video.play()
        } else {
            video.pause()
        }

        device.setLoading(true)
    }

    initVideo() {
        const { props: { device: { source } } } = this

        if(!source) return

        const { manifestUrl, urls }  = source

        if (urls && urls.length > 0) {
            this.startVideo()
        } else if (manifestUrl) {
            this.dispose()
            this.setHlsVideoFile({ url: manifestUrl })
            this.restoreVideoState()
        } else {
            const { device } = this.props

            device.setLoading(false)
            device.setError(localization.cantPlayMedia)
            this.logError('No suitable video source')
            return
        }
    }

    startVideo() {
        const { device: { source: { urls }, quality, audioTrack } } = this.props
        let videoUrls

        if (audioTrack) {
            videoUrls = urls.filter((it) => it.audio == audioTrack)
            if (videoUrls.length == 0) {
                videoUrls = urls
            }
        } else {
            videoUrls = urls
        }

        const selectedQuality = quality || 720

        this.videoUrls = [].concat(videoUrls)

        const selectedIndex = this.videoUrls.findIndex((it) => it.quality == selectedQuality)

        if(selectedIndex == -1) {
            this.setVideoFile(this.videoUrls.shift())
        } else {
            this.setVideoFile(this.videoUrls.splice(selectedIndex, 1)[0])
        }
    }

    setVideoFile(file) {
        this.dispose()

        if(file.url.endsWith("m3u8")) {
            this.setHlsVideoFile(file)
        } else { 
            this.setNativeVideoFile(file)
        }

        this.restoreVideoState()
    }

    setNativeVideoFile({ url, extractor }) {
        const video = this.video.current

        if (extractor) {
            video.src = createExtractorUrlBuilder(extractor)(url)
        } else {
            video.src = url.startsWith('//') ? 'https:' + url : url
        }
    }

    setHlsVideoFile({ url, extractor }) {
        const { props: { device } } = this
        const { source: { manifestExtractor } } = device

        if (manifestExtractor || extractor) {
            url = createExtractorUrlBuilder(manifestExtractor)(manifestUrl)
        }


        const video = this.video.current
        if(video.canPlayType('application/vnd.apple.mpegurl') !== '') {
            video.src = manifestUrl
            return
        }

        const hls = new Hls({
            startPosition: device.currentTime,
            xhrSetup: (xhr) => {
                xhr.timeout = 0
            }
        })

        hls.attachMedia(this.video.current)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            // this.restoreVideoState()

            if (hls.audioTracks && hls.audioTracks.length > 1) {
                this.hlsMultiAudio = true
                device.setAudioTracks(
                    hls.audioTracks.map(({ id, name }) => ({ id, name }))
                )
            }
        })
        hls.on(Hls.Events.ERROR, this.handleHLSError)


        hls.loadSource(url)
        this.hls = hls
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
           
                    this.restoreVideoState()         
                    break
                case Hls.ErrorTypes.MEDIA_ERROR:
                    console.log('fatal media error encountered, try to recover') // eslint-disable-line
                    this.hls.recoverMediaError()
                    break
                default:
                    // cannot recover
                    if(this.tryNextVideoUrl()) 
                        break

                    this.props.device.setError(localization.cantPlayMedia)
                    this.hls.destroy()
                    this.logError(data)
                    break
            }
        }
    }

    handleError = () => {
        const { props: { device } } = this
        const video = this.video.current

        let code
        let retry = true
        let videoErrorCode = video.error && video.error.code
        let videoErrorMessage = video.error && video.error.message

        switch (videoErrorCode) {
            case MediaError.MEDIA_ERR_ABORTED:
                code = 'MEDIA_ERR_ABORTED'
                retry = false
                break
            case MediaError.MEDIA_ERR_NETWORK:
                code = 'MEDIA_ERR_NETWORK'
                break
            case MediaError.MEDIA_ERR_DECODE:
                code = 'MEDIA_ERR_DECODE'
                break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                code = 'MEDIA_ERR_SRC_NOT_SUPPORTED'
                retry = false
                break
        }

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

        if(this.tryNextVideoUrl())
            return

        device.setError(localization.cantPlayMedia)
        device.setLoading(false)

        this.logError({
            code,
            message: videoErrorMessage,
            videoSrc: video.src
        })
    }

    tryNextVideoUrl = () => {
        const { videoUrls } = this
        //try another urls
        if (videoUrls && videoUrls.length > 0) {
            setTimeout(() => {
                this.setVideoUrl(this.videoUrls.shift())
            }, 1)
            return true
        }
        return false
    }

    handleLoadedMetadata = () => {
        const { device } = this.props

        this.handleUpdate()
        this.handleResize()

        device.setError(null)
        device.setLoading(false)
    }

    handleResize = () => {
        const video = this.video.current
        if (this.container.current) {
            video.className = `scale_${this.getVideoScale()}`
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
        const { buffered, duration, currentTime } = this.video.current

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
        const video = this.video.current
        const container = this.container.current

        const originAspectRatio = video.videoWidth / video.videoHeight
        const containerAspectRatio = container.clientWidth / container.clientHeight

        if (originAspectRatio < containerAspectRatio)
            return 'vert'

        return 'hor'
    }

    logError(errorData) {
        const { props: { device: { source } } } = this

        logger.error('Can`t play media', {
            title: document.title,
            url: location.href,
            source: toJS(source),
            details: errorData,
        })

        analytics('errorPlayback', 'Can`t play media')
    }

    render() {
        return (
            <div className="player__player-screen" ref={this.container}>
                <ReactResizeDetector
                    skipOnMount
                    handleWidth
                    handleHeight
                    onResize={this.handleResize}
                />
                <video
                    ref={this.video}
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