import React, { Component } from 'react'
import VideoSeekSlider from './VideoSeekSlider'
import '../video-slider.scss'
import PropTypes from 'prop-types'
import { Paper, IconButton, Slide, Tooltip } from '@material-ui/core'
import {
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    SkipPrevious as PreviousIcon,
    SkipNext as NextIcon,
    List as ListIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon
} from '@material-ui/icons'
import SoundControl from './SoundControl'
import { isTouchDevice } from '../utils'
import { observer } from 'mobx-react'
import AudioTrackSelector from './AudioTrackSelector'
import VideoQualitySelector from './VideoQualitySelector'
import PlaySettingsSelector from './PlaySettingsSelector'
import MobileSoundControl from './MobileSoundControl'
import localization from '../localization'

@observer
class MediaControls extends Component {
    render() {
        const {
            onPlayPause,
            onSeek,
            onSeekEnd,
            onPlaylistToggle,
            onFullScreenToggle,
            fullScreen,
            device,
            onPrev,
            onNext
        } = this.props

        const {
            currentFileIndex,
            playlist: { files },
            playMode
        } = device

        const mobile = isTouchDevice()
        const hasAudioTracks = device.audioTracks.length > 1
        const hasQualities = device.qualities.length > 1
        const disablePrev = playMode == 'shuffle' || currentFileIndex == 0
        const disableNext = currentFileIndex >= files.length - 1 && playMode != 'shuffle'

        return (
            <Slide direction="up" in mountOnEnter unmountOnExit>
                <Paper elevation={0} square className="player-controls">
                    <VideoSeekSlider
                        buffered={device.buffered}
                        currentTime={device.seekTo || device.currentTime}
                        seekTime={device.seekTime}
                        duration={device.duration}
                        onSeekEnd={(time) => onSeekEnd(time)}
                        onSeekTime={(time) => onSeek(time)}
                    />
                    <div className="player-controls__panel">
                        <div className="player-controls__panel-section">
                            <Tooltip title={localization.formatString(localization.hotkey, 'PgUp, [')}>
                                <span>
                                    <IconButton onClick={onPrev} disabled={disablePrev}>
                                        <PreviousIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title={localization.formatString(localization.hotkey, 'Space')}>
                                <IconButton onClick={() => onPlayPause()}>
                                    {!device.isPlaying ? <PlayIcon /> : <PauseIcon />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={localization.formatString(localization.hotkey, 'PgDn, ]')}>
                                <span>
                                    <IconButton onClick={onNext} disabled={disableNext}>
                                        <NextIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <PlaySettingsSelector device={device} />
                            {mobile && <MobileSoundControl device={device} />}
                            {!mobile && <SoundControl device={device} />}
                            {hasAudioTracks && <AudioTrackSelector device={device} />}
                        </div>
                        <div className="player-controls__panel-section">
                            {hasQualities && <VideoQualitySelector device={device} />}
                            <Tooltip title={localization.formatString(localization.hotkey, 'F, Enter')}>
                                <IconButton onClick={() => onFullScreenToggle()}>
                                    {!fullScreen && <FullscreenIcon />}
                                    {fullScreen && <FullscreenExitIcon />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={localization.formatString(localization.hotkey, 'P')}>
                                <IconButton onClick={() => onPlaylistToggle()}>
                                    <ListIcon />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>
                </Paper>
            </Slide>
        )
    }
}

MediaControls.propTypes = {
    device: PropTypes.object.isRequired,
    onPlayPause: PropTypes.func.isRequired,
    onSeek: PropTypes.func.isRequired,
    onSeekEnd: PropTypes.func.isRequired,
    onPlaylistToggle: PropTypes.func.isRequired,
    onFullScreenToggle: PropTypes.func,
    onPrev: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    fullScreen: PropTypes.bool,
    castAvalaible: PropTypes.bool,
    showCastDialog: PropTypes.func,
    switchToLocalDevice: PropTypes.func,
}

export default MediaControls