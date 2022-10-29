import React, { useCallback, useEffect, useState } from 'react'

import {
  FastForwardRounded as FastForwardIcon,
  FastRewindRounded as FastRewindIcon,
  PlayCircleFilled as PlayIcon
} from '@material-ui/icons'
import { addGlobalKey, removeGlobalKey } from '../utils/globalKeys'
import { observer } from 'mobx-react-lite'
import { Typography, CircularProgress } from '@material-ui/core'
import { toHHMMSS } from '../utils'

export default observer(({ device, onPlayPause, onSeek, onSeekEnd }) => {
  const [self] = useState({})
  const [seekMode, setSeekMode] = useState(null)
  const [accTime, setAccTime] = useState(null)
  const { isPlaying, isLoading } = device

  const delayStartSeeking = useCallback((e, requestSeekMode, skipTime) => {
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
        onSeekEnd(targetTime, true)
        clearTimeout(self.seekDelayTimeout)
        setSeekMode(null)
        setAccTime(null)
        self.accTime = null
      },
      400
    )
  }, [device, onSeek, onSeekEnd, self])

  const handleFastFroward = useCallback((e) => delayStartSeeking(e, 'ff', 10), [delayStartSeeking])
  const handleFastFroward1Min = useCallback((e) => delayStartSeeking(e, 'ff', 60), [delayStartSeeking])
  const handleFastRewind = useCallback((e) => delayStartSeeking(e, 'fr', 10), [delayStartSeeking])
  const handleFastRewind1Min = useCallback((e) => delayStartSeeking(e, 'fr', 60), [delayStartSeeking])

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
      onClick={() => onPlayPause()}
    >
      {(accTime === null && isPlaying && isLoading) &&
        <div className="player_loader-indicator center">
          <CircularProgress color="primary" />
        </div>
      }
      <div className="playback-skip__indicator">
        {accTime !== null &&
          <Typography className="center shadow-border" variant="h2">
            {seekMode == 'ff' ? '+' : '-'}{toHHMMSS(accTime)}
          </Typography>
        }
        {paused && <PlayIcon className="center shadow-icon" fontSize="inherit" />}
      </div>
      <div
        className="playback-skip backward"
        onClick={self.handleFastRewind}
      >
        {paused && <FastRewindIcon className="center shadow-icon" fontSize="inherit" />}
      </div>
      <div
        className="playback-skip forward"
        onClick={self.handleFastFroward}
      >
        {paused && <FastForwardIcon className="center shadow-icon" fontSize="inherit" />}
      </div>
    </div>
  )
})
