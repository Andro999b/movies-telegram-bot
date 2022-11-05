import React from 'react'
import VideoSeekSlider from './VideoSeekSlider'
import { Paper, IconButton, Slide, Tooltip } from '@mui/material'
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipPrevious as PreviousIcon,
  SkipNext as NextIcon,
  List as ListIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material'
import SoundControl from './SoundControl'
import { isTouchDevice } from '../utils'
import { observer } from 'mobx-react-lite'
import AudioTrackSelector from './AudioTrackSelector'
import PlaySettingsSelector from './PlaySettingsSelector'
import MobileSoundControl from './MobileSoundControl'
import localization from '../localization'
import AutoPlaySwitch from './AutoPlaySwitcher'
import { Device } from '../store/player-store'

interface Props {
  device: Device
  onPlayPause: () => void
  onSeek: (time: number | null) => void,
  onSeekEnd: (time: number) => void,
  onPlaylistToggle: () => void,
  onFullScreenToggle: () => void,
  onPrev: () => void,
  onNext: () => void,
  fullScreen: boolean
}

const MediaControls: React.FC<Props> = ({
  device,
  onPlayPause,
  onSeek,
  onSeekEnd,
  onPlaylistToggle,
  onFullScreenToggle,
  onPrev,
  onNext,
  fullScreen
}) => {
  const {
    currentFileIndex, playlist: { files }, playMode
  } = device

  const mobile = isTouchDevice()
  const hasAudioTracks = device.audioTracks.length > 1
  const disablePrev = playMode == 'shuffle' || currentFileIndex == 0
  const disableNext = currentFileIndex >= files.length - 1 && playMode != 'shuffle'

  return (
    <Slide direction="up" in mountOnEnter unmountOnExit>
      <Paper elevation={0} square className="player-controls">
        <VideoSeekSlider
          buffered={device.buffered}
          currentTime={device.seekTo || device.currentTime}
          seekTime={device.seekTime ?? 0}
          duration={device.duration}
          onSeekEnd={onSeekEnd}
          onSeekTime={onSeek} />
        <div className="player-controls__panel">
          <div className="player-controls__panel-section">
            <Tooltip title={localization.formatString(localization.hotkey, 'PgUp, [')}>
              <span>
                <IconButton onClick={onPrev} disabled={disablePrev} size="medium">
                  <PreviousIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={localization.formatString(localization.hotkey, 'Space')}>
              <IconButton onClick={onPlayPause} size="medium">
                {!device.isPlaying ? <PlayIcon /> : <PauseIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={localization.formatString(localization.hotkey, 'PgDn, ]')}>
              <span>
                <IconButton onClick={onNext} disabled={disableNext} size="medium">
                  <NextIcon />
                </IconButton>
              </span>
            </Tooltip>
            {mobile && <MobileSoundControl device={device} />}
            {!mobile && <SoundControl device={device} />}
            {hasAudioTracks && <AudioTrackSelector device={device} />}
          </div>
          <div className="player-controls__panel-section">
            <AutoPlaySwitch device={device} />
            <PlaySettingsSelector device={device} />
            <Tooltip title={localization.formatString(localization.hotkey, 'F, Enter')}>
              <IconButton onClick={onFullScreenToggle} size="medium">
                {!fullScreen && <FullscreenIcon />}
                {fullScreen && <FullscreenExitIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={localization.formatString(localization.hotkey, 'P')}>
              <IconButton onClick={onPlaylistToggle} size="medium">
                <ListIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </Paper>
    </Slide>
  )
}

export default observer(MediaControls)
