import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
    FastForwardRounded as FastForwardIcon,
    FastRewindRounded as FastRewindIcon,
    PlayCircleFilled as PlayIcon
} from '@material-ui/icons'
import { addGlobalKey, removeGlobalKey } from '../utils/globalKeys'
import { observer } from 'mobx-react'
import { Typography, CircularProgress } from '@material-ui/core'

@observer
class PlayBackZones extends Component {

    state = { seekMode: null, accTime: null }

    handleFastFroward = (e) => {
        this.delayStartSeeking(e, 'ff')
    }

    handleFastRewind = (e) => {
        this.delayStartSeeking(e, 'fr')
    }

    delayStartSeeking = (e, seekMode) => {
        if(e) {
            e.stopPropagation()
            e.preventDefault()
        }

        if(this.state.seekMode && this.state.seekMode != seekMode) return

        clearTimeout(this.seekDelayTimeout)

        const { device, onSeek, onSeekEnd } = this.props

        this.accTime =(this.accTime || 0) + 10

        this.setState({ seekMode, accTime: this.accTime })

        const { currentTime, seekTo } = device

        let targetTime = seekTo || currentTime
        targetTime = seekMode == 'ff' ? targetTime + this.accTime : targetTime - this.accTime
        onSeek(targetTime)

        this.seekDelayTimeout = setTimeout(
            () => {
                onSeekEnd(targetTime, true)

                this.cleanUpListeners()
                this.cleanUpState()
            },
            400
        )
    }

    componentDidMount() {
        addGlobalKey('ArrowRight', this.handleFastFroward)
        addGlobalKey('ArrowLeft', this.handleFastRewind)
    }

    componentWillUnmount() {
        this.cleanUpListeners()
        removeGlobalKey(['ArrowLeft', 'ArrowRight'])
    }

    cleanUpState() {
        this.setState({ seekMode: null, accTime: null })

        this.accTime = null
    }

    cleanUpListeners() {
        clearTimeout(this.seekDelayTimeout)
    }

    render() {
        const { seekMode, accTime } = this.state
        const { device: { isPlaying, isLoading }, onPlayPause } = this.props
        const paused = accTime === null && !isPlaying

        return (
            <div
                className={`player__pause-zone ${(isPlaying || isLoading) ? '' : 'player__pause-cover'}`}
                onClick={() => onPlayPause() }
            >
                {(accTime === null && isLoading) && 
                    <div className="player_loader-indicator center">
                        <CircularProgress color="primary" />
                    </div>
                }
                <div className="playback-skip__indicator">
                    {accTime !== null &&
                        <Typography className="center shadow-border" variant="h2">
                            {seekMode == 'ff' ? '+' : '-'}{accTime}s
                        </Typography>
                    }
                    {paused && <PlayIcon className="center shadow-icon" fontSize="inherit" />}
                </div>
                <div
                    className="playback-skip backward"
                    onClick={this.handleFastRewind}
                >
                    {paused && <FastRewindIcon className="center shadow-icon" fontSize="inherit" />}
                </div>
                <div
                    className="playback-skip forward"
                    onClick={this.handleFastFroward}
                >
                    { paused && <FastForwardIcon className="center shadow-icon" fontSize="inherit"/> }
                </div>
            </div>
        )
    }
}

PlayBackZones.propTypes = {
    device: PropTypes.object.isRequired,
    onPlayPause: PropTypes.func.isRequired,
    onSeek: PropTypes.func.isRequired,
    onSeekEnd: PropTypes.func.isRequired,
}

export default PlayBackZones