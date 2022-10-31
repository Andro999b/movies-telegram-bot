import React, { useEffect, useRef, useState } from 'react'
import { toHHMMSS, isTouchDevice } from '../utils'

export default ({
  buffered = null,
  currentTime = 0,
  duration = 100,
  seekTime, onSeekTime, onSeekEnd
}) => {
  const track = useRef()
  const [trackWidth, setTrackWidth] = useState()

  const handleSeekEnd = (e) => {
    onSeekTime(null)
    onSeekEnd(calcTime(e))
  }

  const handleStartHover = (e) => onSeekTime(calcTime(e))
  const handleEndHover = () => onSeekTime(null)

  const calcTime = (e) => {
    let posx
    if (e.touches) {
      posx = e.touches[0].pageX
    } else {
      posx = e.pageX
    }

    const position = posx - track.current.getBoundingClientRect().left
    return duration * (position / trackWidth)
  }

  const getPositionStyle = (startTime, endTime, duration) => {
    const translate = (startTime / duration) * 100 + '%'
    const scale = (endTime / duration) + ''
    return { transform: `scaleX(${scale}) translateX(${translate})` }
  }

  useEffect(() => {
    const setTrackWidthState = () => setTrackWidth(track.current.offsetWidth)
    setTrackWidthState()
    window.addEventListener('resize', setTrackWidthState)

    return () => window.removeEventListener('resize', setTrackWidthState)
  }, [])

  const bufferedFragments = []
  if (buffered) {
    for (let i = 0; i < buffered.length; i++) {
      bufferedFragments.push(
        <div key={i} className="buffered" style={getPositionStyle(buffered.start(i), buffered.end(i), duration)} />
      )
    }
  }

  const hasDuration = !isNaN(duration) && duration > 0

  return (
    <div className="ui-video-seek-slider">
      <div
        className={seekTime != null ? 'track active' : 'track'}
        ref={track}
        onPointerUp={handleSeekEnd}
        onMouseMove={isTouchDevice() ? null : handleStartHover}
        onMouseLeave={isTouchDevice() ? null : handleEndHover}
      >
        <div className="main">
          {hasDuration && <>
            {bufferedFragments}
            <div className="connect" style={getPositionStyle(0, currentTime, duration)} />
            {seekTime != null && <div className="seek-hover" style={getPositionStyle(0, seekTime, duration)} />}
            <div className="time-indicator shadow-border" >
              {seekTime ? toHHMMSS(seekTime) : toHHMMSS(currentTime)} / {toHHMMSS(duration)}
            </div>
          </>}
        </div>
      </div>
    </div>
  )
}
