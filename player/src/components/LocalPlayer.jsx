import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Fullscreen from 'react-full-screen'

import MediaControls from './MediaControls'
import PlayerFilesList from './PlayerPlayList'
import PlayerTitle from './PlayerTitle'
import VideoScrean from './VideoScrean'
import PlayBackZones from './PlayBackZones'
import ShowIf from './ShowIf'
import Share from './Share'

import { Typography, CircularProgress } from '@material-ui/core'
import { observer, inject } from 'mobx-react'

import { isTouchDevice } from '../utils'

const IDLE_TIMEOUT = 3000

@inject('playerStore')
@observer
class LocalPlayer extends Component {

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
        const { isLoading, error, seekTime } = device

        const hideUi = idle && seekTime == null

        return (
            <Fullscreen
                enabled={fullScreen}
                onChange={this.handleSetFullScreen}
            >
                <div className={hideUi ? 'idle' : ''}>
                    <ShowIf mustNot={[hideUi]}>
                        <PlayerTitle title={playerStore.getPlayerTitle()} />
                    </ShowIf>
                    <VideoScrean device={device} onEnded={playerStore.nextFile} />
                    <ShowIf must={[error]}>
                        <Typography className="center shadow-border" variant="h4">{error}</Typography>
                    </ShowIf>
                    <ShowIf mustNot={[error]}>
                        <ShowIf must={[isLoading]}>
                            <div className="center">
                                <CircularProgress color="primary" />
                            </div>
                        </ShowIf>
                    </ShowIf>
                    <PlayBackZones device={device} onClick={this.handleClick} />
                    <ShowIf mustNot={[hideUi]}>
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
                    </ShowIf>
                </div>
            </Fullscreen >
        )
    }
}

LocalPlayer.propTypes = {
    playerStore: PropTypes.object,
    initialFullScreen: PropTypes.bool
}

export default LocalPlayer