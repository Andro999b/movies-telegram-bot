import React, { useCallback, useEffect, useRef, useState } from 'react'

import fscreen from 'fscreen'

import MediaControls from './MediaControls'
import PlayerFilesList from './PlayerPlayList'
import PlayerTitle from './PlayerTitle'
import Video from './Video'
import PlayBackZones from './PlayBackZones'
import Share from './Share'
import { addGlobalKey, removeGlobalKey } from '../utils/globalKeys'

import { Typography } from '@material-ui/core'
import { observer } from 'mobx-react-lite'

import { isTouchDevice } from '../utils'
import { playerStore } from '../store'

const IDLE_TIMEOUT = 10000

const HandleActionListener = ({ idle, onAction, children }) => {
  const handleClick = (e) => {
    if (idle) {
      e.preventDefault()
      e.stopPropagation()
      onAction()
    }
  }

  if (isTouchDevice()) {
    return (<div onClickCapture={handleClick} onTouchMoveCapture={onAction}>
      {children}
    </div>)
  } else {
    return (<div onMouseMove={onAction}>
      {children}
    </div>)
  }
}

export default observer(({ initialFullScreen }) => {
  const [self] = useState({})
  const [playlistOpen, setPlaylistOpen] = useState(false)
  const [idle, setIdle] = useState(false)
  const [fullScreen, setFullScreen] = useState(false)
  const container = useRef()

  const { device } = playerStore
  const { error } = device

  const handleTogglePlayList = useCallback(() => setPlaylistOpen((prev) => !prev), [])

  const handlePlayPause = () => {
    if (device.isLoading) return

    if (device.isPlaying) {
      device.pause()
    } else {
      device.play()
    }
  }

  const handleSeek = (time) => device.seeking(time)

  const handleSeekEnd = (time, autoPlay = false) => {
    if (autoPlay) {
      device.play(time, autoPlay)
    } else {
      device.seek(time)
    }
  }

  // const handleIdle = (idle) => setIdle(idle)

  const handleSelectFile = (fileIndex) => {
    playerStore.switchFile(fileIndex)
    if (isTouchDevice()) setPlaylistOpen(false)
  }

  const handleToggleFullscreen = useCallback(() => {
    if (fscreen.fullscreenEnabled) {
      if (fullScreen) {
        fscreen.exitFullscreen()
      } else {
        fscreen.requestFullscreen(container.current)
      }
    }
  }, [fullScreen])
  useEffect(
    () => addGlobalKey(['KeyF', 'Enter'], handleToggleFullscreen),
    [handleToggleFullscreen]
  )

  // --- idle checking ---
  const handleActivity = useCallback(() => {
    clearTimeout(self.idleTimeout)
    self.idleTimeout = setTimeout(() => setIdle(true), IDLE_TIMEOUT)
    setIdle(false)
  }, [self])

  useEffect(() => {
    self.idleTimeout = setTimeout(() => setIdle(true), IDLE_TIMEOUT)
    return () => clearTimeout(self.idleTimeout)
  }, [self])

  useEffect(() => {
    addGlobalKey(['KeyP'], () => {
      if (idle) {
        setPlaylistOpen(true)
        handleActivity()
      } else {
        handleTogglePlayList()
      }
    })
  }, [handleActivity, handleTogglePlayList, idle])

  useEffect(() => {
    addGlobalKey(['KeyM'], () => device.toggleMute())
    addGlobalKey('Space', () => {
      if (device.isPlaying) {
        device.pause()
      } else {
        device.play()
      }
    })
  }, [device])

  useEffect(() => {
    const handleFullScreenChanged = () => {
      const fullScreen = fscreen.fullscreenElement !== null
      setFullScreen(fullScreen)
      if (fullScreen) {
        if (isTouchDevice() && screen.orientation) {
          screen.orientation.lock('landscape')
        }
        setIdle(true)
      }
    }

    fscreen.addEventListener('fullscreenchange', handleFullScreenChanged, false)
    if (fscreen.fullscreenEnabled && initialFullScreen) {
      fscreen.requestFullscreen(container.current)
    }

    return () => {
      fscreen.removeEventListener('fullscreenchange', handleFullScreenChanged)
    }
  }, [initialFullScreen])

  useEffect(() => {
    addGlobalKey(['PageUp', 'BracketLeft'], () => playerStore.prevFile())
    addGlobalKey(['PageDown', 'BracketRight'], () => playerStore.nextFile())

    return () => {
      removeGlobalKey([
        'Space', 'Enter',
        'KeyF', 'KeyM', 'KeyP',
        'PageUp', 'PageDown',
        'BracketLeft', 'BracketRight'
      ])
    }
  }, [])

  // always show ui in case of error
  const hideUi = error != null ? false : idle

  return (
    <div ref={container}>
      <HandleActionListener idle={idle} onAction={handleActivity}>
        <div id="player_root" className={hideUi ? 'idle' : ''}>
          {error && <Typography className="center" variant="h4">{error}</Typography>}
          {!error &&
            <PlayBackZones
              device={device}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onSeekEnd={handleSeekEnd}
            />
          }
          {(!error && device.source) && <Video device={device} onEnded={playerStore.fileEnd} />}
          {!hideUi && <>
            <PlayerTitle title={playerStore.getPlayerTitle()} />
            <Share device={device} playlist={device.playlist} />
            <PlayerFilesList
              open={playlistOpen}
              device={device}
              onFileSelected={handleSelectFile}
            />
            <MediaControls
              fullScreen={fullScreen}
              device={device}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onSeekEnd={handleSeekEnd}
              onNext={() => playerStore.nextFile()}
              onPrev={() => playerStore.prevFile()}
              onPlaylistToggle={handleTogglePlayList}
              onFullScreenToggle={handleToggleFullscreen}
            />
          </>}
        </div>
      </HandleActionListener>
    </div>
  )
})
