import React, { useCallback, useEffect, useState, MouseEvent } from 'react'

import {
  FastForwardRounded as FastForwardIcon,
  FastRewindRounded as FastRewindIcon,
  PlayCircleFilled as PlayIcon
} from '@mui/icons-material'
import { addGlobalKey, removeGlobalKey } from '../utils/globalKeys'
import { observer } from 'mobx-react-lite'
import { Typography, CircularProgress } from '@mui/material'
import { toHHMMSS } from '../utils'
import { Device } from '../store/player-store'

interface Props {
  device: Device
  onPlayPause: () => void
  onSeek: (time: number | null) => void
  onSeekEnd: (time: number) => void
}

interface Self {
  seekDelayTimeout?: NodeJS.Timeout
  accTime: number | null
}

const PlayBackZones: React.FC<Props> = ({ device, onPlayPause, onSeek, onSeekEnd }) => {
  const [self] = useState<Self>({ accTime: null })
  const [seekMode, setSeekMode] = useState<'ff' | 'fr' | null>(null)
  const [accTime, setAccTime] = useState<number | null>(null)
  const { isPlaying, isLoading } = device

  const delayStartSeeking = useCallback((
    e: MouseEvent | null,
    requestSeekMode: 'ff' | 'fr',
    skipTime: number
  ): void => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }

    clearTimeout(self.seekDelayTimeout)

    self.accTime = (self.accTime || 0) + skipTime

    setSeekMode(requestSeekMode)
    setAccTime(self.accTime)

    const { currentTime, seekTo } = device

    let targetTime = seekTo || currentTime
    targetTime = requestSeekMode == 'ff' ? targetTime + self.accTime : targetTime - self.accTime
    onSeek(targetTime)

    self.seekDelayTimeout = setTimeout(
      () => {
        onSeekEnd(targetTime)
        clearTimeout(self.seekDelayTimeout)
        setSeekMode(null)
        setAccTime(null)
        self.accTime = null
      },
      600
    )
  }, [device, onSeek, onSeekEnd, self])

  const handleFastFroward = useCallback((e?: MouseEvent): void => delayStartSeeking(e ?? null, 'ff', 10), [delayStartSeeking])
  const handleFastFroward1Min = useCallback((e?: MouseEvent): void => delayStartSeeking(e ?? null, 'ff', 60), [delayStartSeeking])
  const handleFastRewind = useCallback((e?: MouseEvent): void => delayStartSeeking(e ?? null, 'fr', 10), [delayStartSeeking])
  const handleFastRewind1Min = useCallback((e?: MouseEvent): void => delayStartSeeking(e ?? null, 'fr', 60), [delayStartSeeking])

  useEffect(() => {
    addGlobalKey('ArrowRight', handleFastFroward)
    addGlobalKey('ArrowLeft', handleFastRewind)
    addGlobalKey('ArrowDown', handleFastFroward1Min)
    addGlobalKey('ArrowUp', handleFastRewind1Min)
  }, [handleFastFroward, handleFastFroward1Min, handleFastRewind, handleFastRewind1Min])

  useEffect(() => {
    return () => {
      clearTimeout(self.seekDelayTimeout)
      removeGlobalKey(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'])
    }
  }, [self])

  const paused = accTime === null && !isPlaying

  return (
    <div
      className={`player__pause-zone ${(isPlaying || isLoading) ? '' : 'player__pause-cover'}`}
      onClick={onPlayPause}
    >
      {(accTime === null && isPlaying && isLoading) &&
        <div className="player_loader-indicator center">
          <CircularProgress color="primary" />
        </div>}
      <div className="playback-skip__indicator">
        {accTime !== null &&
          <Typography className="center shadow-border" variant="h2">
            {seekMode == 'ff' ? '+' : '-'}{toHHMMSS(accTime)}
          </Typography>}
        {paused && <PlayIcon className="center shadow-icon" fontSize="inherit" />}
      </div>
      <div
        className="playback-skip backward"
        onClick={handleFastRewind}
      >
        {paused && <FastRewindIcon className="center shadow-icon" fontSize="inherit"  />}
      </div>
      <div
        className="playback-skip forward"
        onClick={handleFastFroward}
      >
        {paused && <FastForwardIcon className="center shadow-icon" fontSize="inherit" />}
      </div>
    </div>
  )
}

export default observer(PlayBackZones)
