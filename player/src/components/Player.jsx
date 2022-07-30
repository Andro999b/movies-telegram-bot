import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { FullScreen } from 'react-full-screen'

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
        if(this.props.idle) {
            e.preventDefault()
            e.stopPropagation()
            this.props.onAction()
        }
    }

    render() {
        if(isTouchDevice()) { 
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

    constructor(props) {
        super(props)

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

    handlePlayPause = () => {
        const { props: { playerStore: { device } } } = this

        if(device.isLoading) return

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

        if(autoPlay) {
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
        const fullScreen = !this.state.fullScreen
        this.setState({ fullScreen })
    }

    handleTogglePlayback = () => {
        const { props: { playerStore: { device } } } = this
        if (device.isPlaying) {
            device.pause()
        } else {
            device.play()
        }
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
        clearTimeout(idleTimeout);
        removeGlobalKey(['Space', 'KeyF', 'Enter', 'PageUp', 'PageDown'])
    }

    componentDidMount() {
        this.setIdleTimeout()
        addGlobalKey('Space', this.handleTogglePlayback)
        addGlobalKey(['KeyF', 'Enter'], this.handleToggleFullscreen)
        addGlobalKey('PageUp', () => this.props.playerStore.prevFile())
        addGlobalKey('PageDown', () => this.props.playerStore.nextFile())
    }
    // --- idle checking ---

    render() {
        const { playerStore } = this.props
        const { playlistOpen, idle, fullScreen } = this.state
        const { device } = playerStore
        const { error } = device
        
        const hideUi = idle

        return (
            <Fullscreen
                enabled={fullScreen}
                onChange={this.handleSetFullScreen}
            >
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
            </Fullscreen >
        )
    }
}

Player.propTypes = {
    playerStore: PropTypes.object,
    initialFullScreen: PropTypes.bool
}

export default Player