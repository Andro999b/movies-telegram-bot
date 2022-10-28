import React, { Component } from 'react'
import PropTypes from 'prop-types'

import fscreen from 'fscreen'

import MediaControls from './MediaControls'
import PlayerFilesList from './PlayerPlayList'
import PlayerTitle from './PlayerTitle'
import VideoScrean from './VideoScrean'
import PlayBackZones from './PlayBackZones'
import Share from './Share'
import { addGlobalKey, removeGlobalKey } from '../utils/globalKeys'

import { Typography } from '@material-ui/core'
import { observer, inject } from 'mobx-react'

import { isTouchDevice } from '../utils'

const IDLE_TIMEOUT = 10000

class HandleActionListener extends Component {

    handleClick = (e) => {
        if (this.props.idle) {
            e.preventDefault()
            e.stopPropagation()
            this.props.onAction()
        }
    }

    render() {
        if (isTouchDevice()) {
            return (<div onClickCapture={this.handleClick} onTouchMoveCapture={() => this.props.onAction()}>
                {this.props.children}
            </div>)
        } else {
            return (<div onMouseMove={() => this.props.onAction()}>
                {this.props.children}
            </div>)
        }
    }
}

HandleActionListener.propTypes = {
    idle: PropTypes.bool,
    onAction: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired
}


@inject('playerStore')
@observer
class Player extends Component {
    container = React.createRef()

    constructor(props) {
        super(props)

        this.state = {
            playlistOpen: false,
            idle: false,
            fullScreen: false
        }
    }

    handleTogglePlayList = () => {
        this.setState((prevState) => ({
            playlistOpen: !prevState.playlistOpen
        }))
    }

    handlePlayPause = () => {
        const { props: { playerStore: { device } } } = this

        if (device.isLoading) return

        if (device.isPlaying) {
            device.pause()
        } else {
            device.play()
        }
    }

    handleSeek = (time) => {
        const { props: { playerStore: { device } } } = this
        device.seeking(time)
    }

    handleSeekEnd = (time, autoPlay = false) => {
        const { props: { playerStore: { device } } } = this

        if (autoPlay) {
            device.play(time, autoPlay)
        } else {
            device.seek(time)
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
        if(fscreen.fullscreenEnabled) {
            if(this.state.fullScreen) {
                fscreen.exitFullscreen()
            } else {
                fscreen.requestFullscreen(this.container.current)
            }  
        }
    }

    handleTogglePlayback = () => {
        const { props: { playerStore: { device } } } = this
        if (device.isPlaying) {
            device.pause()
        } else {
            device.play()
        }
    }

    handleFullScreenChanged = () => {
        const fullScreen = fscreen.fullscreenElement !== null
        this.setState({ fullScreen })
        if (fullScreen) {
            if (isTouchDevice() && screen.orientation) {
                screen.orientation.lock('landscape')
            }
            this.setState({ idle: true })
        }
    }

    // --- idle checking ---
    handleActivity = () => {
        const { state: { idle }, idleTimeout } = this

        clearTimeout(idleTimeout)
        this.setIdleTimeout()

        if (idle) {
            this.setState({ idle: false })
        }
    }

    setIdleTimeout() {
        this.idleTimeout = setTimeout(
            () => this.setState({ idle: true }),
            IDLE_TIMEOUT
        )
    }

    componentWillUnmount() {
        const { idleTimeout } = this
        clearTimeout(idleTimeout)
        removeGlobalKey([
            'Space', 'Enter',
            'KeyF', 'KeyM', 'KeyP',
            'PageUp', 'PageDown',
            'BracketLeft', 'BracketRight'
        ])
        fscreen.removeEventListener('fullscreenchange', this.handleFullScreenChanged)
    }

    componentDidMount() {
        this.setIdleTimeout()
        addGlobalKey('Space', this.handleTogglePlayback)
        addGlobalKey(['KeyF', 'Enter'], this.handleToggleFullscreen)
        addGlobalKey(['PageUp', 'BracketLeft'], () => this.props.playerStore.prevFile())
        addGlobalKey(['PageDown', 'BracketRight'], () => this.props.playerStore.nextFile())
        addGlobalKey(['KeyM'], () => this.props.playerStore.device.toggleMute())
        addGlobalKey(['KeyP'], () => {
            if (this.state.idle) {
                this.setState({ playlistOpen: true }, () => this.handleActivity())
            } else {
                this.handleTogglePlayList()
            }
        })
        fscreen.addEventListener('fullscreenchange', this.handleFullScreenChanged, false)

        if(fscreen.fullscreenEnabled && this.props.initialFullScreen) {
            fscreen.requestFullscreen(this.container.current)
        }
    }
    // --- idle checking ---

    render() {
        const { playerStore } = this.props
        const { playlistOpen, idle, fullScreen } = this.state
        const { device } = playerStore
        const { error } = device

        // always show ui in case of error
        const hideUi = error != null ? false : idle

        return (
            <div ref={this.container}>
                <HandleActionListener idle={idle} onAction={this.handleActivity}>
                    <div id="player_root" className={hideUi ? 'idle' : ''}>
                        {error && <Typography className="center" variant="h4">{error}</Typography>}
                        {!error &&
                            <PlayBackZones
                                device={device}
                                onPlayPause={this.handlePlayPause}
                                onSeek={this.handleSeek}
                                onSeekEnd={this.handleSeekEnd}
                            />
                        }
                        {!error && <VideoScrean device={device} onEnded={playerStore.fileEnd} />}
                        {!hideUi && <>
                            <PlayerTitle title={playerStore.getPlayerTitle()} />
                            <Share device={device} playlist={device.playlist} />
                            <PlayerFilesList
                                open={playlistOpen}
                                device={device}
                                onFileSelected={this.handleSelectFile}
                            />
                            <MediaControls
                                fullScreen={fullScreen}
                                device={device}
                                onPlayPause={this.handlePlayPause}
                                onSeek={this.handleSeek}
                                onSeekEnd={this.handleSeekEnd}
                                onNext={() => playerStore.nextFile()}
                                onPrev={() => playerStore.prevFile()}
                                onPlaylistToggle={this.handleTogglePlayList}
                                onFullScreenToggle={this.handleToggleFullscreen}
                            />
                        </>}
                    </div>
                </HandleActionListener>
            </div>
        )
    }
}

Player.propTypes = {
    playerStore: PropTypes.object,
    initialFullScreen: PropTypes.bool
}

export default Player