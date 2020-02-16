import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import Fullscreen from 'react-full-screen'

import MediaControls from './MediaControls'
import PlayerFilesList from './PlayerPlayList'
import PlayerTitle from './PlayerTitle'
import VideoScrean from './VideoScrean'
import PlayBackZones from './PlayBackZones'
import Share from './Share'

import { Typography, CircularProgress } from '@material-ui/core'
import { observer, inject } from 'mobx-react'

import { isTouchDevice } from '../utils'

const IDLE_TIMEOUT = 3000

@inject('playerStore')
@observer
class Player extends Component {

    constructor(props, context) {
        super(props, context)

        this.state = {
            playlistOpen: false,
            idle: false,
            fullScreen: props.initialFullScreen
        }
    }

    handleTogglePlayList = () => {
        this.setState((prevState) => ({
            playlistOpen: !prevState.playlistOpen
        }))
    }

    handleClick = () => {
        const { props: { playerStore: { device } }, state: { idle } } = this

        if (isTouchDevice() && idle) {
            this.handleActivity()
            return
        }

        if (device.isPlaying) {
            device.pause()
        } else {
            device.play()
        }
    }

    handleIdle = (idle) => {
        this.setState({ idle })
    }

    handleSelectFile = (fileIndex) => {
        const { playerStore } = this.props
        playerStore.switchFile(fileIndex)

        if (isTouchDevice()) this.setState({ playlistOpen: false })
    }

    handleToggleFullscreen = () => {
        const fullScreen = !this.state.fullScreen
        this.setState({ fullScreen })
    }

    handleSetFullScreen = (fullScreen) => {
        this.setState({ fullScreen })
        if (fullScreen) {
            if (isTouchDevice() && screen.orientation) {
                screen.orientation.lock('landscape')
            }
            this.setState({ idle: true })
        }
    }

    handleKeyUp = (e) => {
        const { props: { playerStore: { device } } } = this

        const step = e.ctrlKey ? 10 : (e.shiftKey ? 60 : 30)

        if (e.code == 'Space') { //spacebar
            if (device.isPlaying) {
                device.pause()
            } else {
                device.play()
            }
        } else if (e.code == 'ArrowLeft') {
            device.skip(-step)
        } else if (e.code == 'ArrowRight') {
            device.skip(step)
        } else if (e.code == 'KeyF') {
            this.handleToggleFullscreen()
        }
    }

    // --- idle checking ---
    handleActivity = () => {
        const { state: { idle }, idleTimeout } = this

        clearTimeout(idleTimeout)
        this.setIdleTimeout()

        if (idle) this.setState({ idle: false })
    }

    setIdleTimeout() {
        this.idleTimeout = setTimeout(
            () => this.setState({ idle: true }),
            IDLE_TIMEOUT
        )
    }

    componentWillUnmount() {
        const { idleTimeout } = this
        clearTimeout(idleTimeout);

        ['pointerdown', 'pointermove', 'mousemove', 'mousedown', 'keydown', 'scroll'].forEach(
            (event) => window.removeEventListener(event, this.handleActivity)
        )

        window.removeEventListener('keyup', this.handleKeyUp)
    }

    componentDidMount() {
        this.setIdleTimeout()
        if (isTouchDevice()) {
            ['pointerdown', 'pointermove', 'scroll'].forEach(
                (event) => window.addEventListener(event, this.handleActivity)
            )
        } else {
            ['mousemove', 'mousedown', 'keydown', 'scroll'].forEach(
                (event) => window.addEventListener(event, this.handleActivity)
            )

            window.addEventListener('keyup', this.handleKeyUp)
        }
    }
    // --- idle checking ---

    render() {
        const { playerStore } = this.props
        const { playlistOpen, idle, fullScreen } = this.state
        const { device } = playerStore
        const { isLoading, error, seekTime, isLocal } = device
        const { playlist: { image } } = device

        const hideUi = idle && seekTime == null
        const local = isLocal()

        return (
            <Fullscreen
                enabled={fullScreen && local}
                onChange={this.handleSetFullScreen}
            >
                <div className={hideUi ? 'idle' : ''}>
                    {!hideUi && <PlayerTitle title={playerStore.getPlayerTitle()} />}
                    {local && <VideoScrean device={device} onEnded={playerStore.nextFile} />}
                    {(!local && !error) &&
                        <div
                            className="player__pause-cover player__background-cover"
                            style={{ backgroundImage: image ? `url(${image})` : null }}
                        >
                            <Typography className="center shadow-border" variant="h4">
                                {device.getName()}
                            </Typography>
                        </div>
                    }
                    {error && <Typography className="center shadow-border" variant="h4">{error}</Typography>}
                    {(isLoading && !error) &&
                        <div className="center">
                            <CircularProgress color="primary" />
                        </div>
                    }
                    {(!isLoading && !error) && <PlayBackZones device={device} onClick={this.handleClick} />}
                    {!hideUi && <Fragment>
                        <Share device={device} />
                        <PlayerFilesList
                            open={playlistOpen}
                            device={device}
                            onFileSelected={this.handleSelectFile}
                        />
                        <MediaControls
                            fullScreen={fullScreen}
                            device={device}
                            onNext={() => playerStore.nextFile()}
                            onPrev={() => playerStore.prevFile()}
                            onPlaylistToggle={this.handleTogglePlayList}
                            onFullScreenToggle={this.handleToggleFullscreen}
                        />
                    </Fragment>}
                </div>
            </Fullscreen >
        )
    }
}

Player.propTypes = {
    playerStore: PropTypes.object,
    initialFullScreen: PropTypes.bool
}

export default Player