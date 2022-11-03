import React, { useEffect, useRef, useState, PointerEvent, MouseEvent } from 'react'
import { toHHMMSS, isTouchDevice } from '../utils'

interface Props {
  buffered: TimeRanges | null
  currentTime: number
  duration: number
  seekTime: number
  onSeekTime: (time: number | null) => void
  onSeekEnd: (time: number) => void
}

interface PositionStyle {
  marginLeft: string
  width: string
}

const VideoSeekSlider: React.FC<Props> = ({
  buffered = null,
  currentTime = 0,
  duration = 100,
  seekTime, onSeekTime, onSeekEnd
}) => {
  const track = useRef<HTMLDivElement | null>(null)
  const [trackWidth, setTrackWidth] = useState(0)

  const handleSeekEnd = (e: PointerEvent): void => {
    onSeekTime(null)
    onSeekEnd(calcTime(e))
  }

  const handleStartHover = (e: MouseEvent): void => onSeekTime(calcTime(e))
  const handleEndHover = (): void => onSeekTime(null)

  const calcTime = (e: MouseEvent): number => {
    const position = e.pageX - track.current!.getBoundingClientRect().left
    return duration * (position / trackWidth)
  }

  const getPositionStyle = (startTime: number, endTime: number, duration: number): PositionStyle => {
    const marginLeft = (startTime / duration) * 100 + '%'
    const width = ((endTime - startTime) / duration) * 100 + '%'
    return { marginLeft, width }
  }

  useEffect(() => {
    const setTrackWidthState = (): void => setTrackWidth(track.current!.offsetWidth)
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
        onMouseMove={isTouchDevice() ? undefined : handleStartHover}
        onMouseLeave={isTouchDevice() ? undefined : handleEndHover}
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

export default VideoSeekSlider