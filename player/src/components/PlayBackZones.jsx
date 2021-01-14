import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
    FastForwardRounded as FastForwardIcon,
    FastRewindRounded as FastRewindIcon,
    PlayCircleFilled as PlayIcon
} from '@material-ui/icons'

import { observer } from 'mobx-react'
import { Typography } from '@material-ui/core'

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
        e.stopPropagation()
        e.preventDefault()

        if(this.state.seekMode && this.state.seekMode != seekMode) return

        clearTimeout(this.seekDelayTimeout)

        const { device } = this.props
        // device.pause()

        this.accTime =(this.accTime || 0) + 10

        this.setState({ seekMode, accTime: this.accTime })

        const { currentTime, seeking } = device

        const targetTime = seekMode == 'ff' ? currentTime + this.accTime : currentTime - this.accTime
        seeking(targetTime)

        this.seekDelayTimeout = setTimeout(
            () => {
                device.play(targetTime)

                this.cleanUpListeners()
                this.cleanUpState()
            },
            400
        )
    }

    componentWillUnmount() {
        this.cleanUpListeners()
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
        const { device: { isPlaying, isLoading }, onClick } = this.props
        const paused = accTime === null && !isPlaying

        return (
            <div
                className={`player__pause-zone ${(isPlaying || isLoading) ? '' : 'player__pause-cover'}`}
                onClick={() => onClick()}
            >
                <div className="playback-skip__indicator">
                    {accTime !== null &&
                        <Typography className="center shadow-border" variant="h2">
                            {seekMode == 'ff' ? '+' : '-'}{accTime}s
                        </Typography>
                    }
                    {paused && <PlayIcon className="center" fontSize="inherit" />}
                </div>
                <div
                    className="playback-skip backward"
                    onClick={this.handleFastRewind}
                >
                    {paused && <FastRewindIcon className="center" fontSize="inherit" />}
                </div>
                <div
                    className="playback-skip forward"
                    onClick={this.handleFastFroward}
                >
                    { paused && <FastForwardIcon className="center" fontSize="inherit"/> }
                </div>
            </div>
        )
    }
}

PlayBackZones.propTypes = {
    device: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
}

export default PlayBackZones