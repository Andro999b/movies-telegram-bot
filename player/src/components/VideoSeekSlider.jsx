import React, { useEffect, useRef, useState } from 'react'
import { toHHMMSS, isTouchDevice } from '../utils'

export default ({
  buffered = 0,
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

  const getPositionStyle = (time, duration) => {
    if (time) {
      return { transform: 'scaleX(' + (time / duration) + ')' }
    } else {
      return { transform: 'scaleX(0)' }
    }
  }

  useEffect(() => {
    const setTrackWidthState = () => setTrackWidth(track.current.offsetWidth)
    setTrackWidthState()
    window.addEventListener('resize', setTrackWidthState)

    return () => window.removeEventListener('resize', setTrackWidthState)
  }, [])

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
          <div className="buffered" style={getPositionStyle(buffered, duration)} />
          <div className="connect" style={getPositionStyle(currentTime, duration)} />
          {seekTime != null && <div className="seek-hover" style={getPositionStyle(seekTime, duration)} />}
          <div className="time-indicator shadow-border" >
            {seekTime ? toHHMMSS(seekTime) : toHHMMSS(currentTime)} / {toHHMMSS(duration)}
          </div>
        </div>
      </div>
    </div>
  )
}
