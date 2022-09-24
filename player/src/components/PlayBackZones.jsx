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
import { toHHMMSS } from '../utils'

@observer
class PlayBackZones extends Component {

    state = { seekMode: null, accTime: null }

    handleFastFroward = (e) => {
        this.delayStartSeeking(e, 'ff', 10)
    }

    handleFastFroward1Min = (e) => {
        this.delayStartSeeking(e, 'ff', 60)
    }

    handleFastRewind = (e) => {
        this.delayStartSeeking(e, 'fr', 10)
    }

    handleFastRewind1Min = (e) => {
        this.delayStartSeeking(e, 'fr', 60)
    }

    delayStartSeeking = (e, seekMode, skipTime) => {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }

        if(this.state.seekMode && this.state.seekMode != seekMode) return

        clearTimeout(this.seekDelayTimeout)

        const { device, onSeek, onSeekEnd } = this.props

        this.accTime =(this.accTime || 0) + skipTime

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
        addGlobalKey('ArrowDown', this.handleFastFroward1Min)
        addGlobalKey('ArrowUp', this.handleFastRewind1Min)
    }

    componentWillUnmount() {
        this.cleanUpListeners()
        removeGlobalKey(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'])
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