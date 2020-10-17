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

    constructor(props) {
        super(props)

        this.state = {
            seekMode: null,
            accTime: null
        }
    }

    handleFastFroward = (e) => {
        this.delayStartSeeking(e, 'ff')
    }

    handleFastRewind = (e) => {
        this.delayStartSeeking(e, 'fr')
    }

    delayStartSeeking = (e, seekMode) => {
        e.stopPropagation()

        if(this.state.seekMode && this.state.seekMode != seekMode) return

        clearInterval(this.stepInterval)
        clearTimeout(this.seekDelayTimeout)

        const { device } = this.props
        device.pause()

        window.addEventListener('pointermove', this.handlePreventScroll, { passive: false })
        window.addEventListener('pointercancel', this.handleSeekEnd)
        window.addEventListener('pointerup', this.handleSeekEnd)

        this.setState(
            { seekMode, accTime: (this.accTime || 0) },
            () => this.delayTimeout = setTimeout(this.startSeeking, 200)
        )
    }

    startSeeking = () => {
        this.lastTs = Date.now()

        clearInterval(this.stepInterval)

        const { device } = this.props
        const { currentTime } = device

        device.seeking(currentTime)
        this.stepInterval = setInterval(this.seekStep, 200)
    }

    handlePreventScroll(e) {
        if (e.cancelable) {
            e.preventDefault()
            e.stopImmediatePropagation()
        }
    }

    handleTapSeek = () => {
        this.accTime = (this.accTime || 0) + 10

        const { seekMode } = this.state
        const { device } = this.props
        const { currentTime, seeking } = device

        this.targetTime = seekMode == 'ff' ? currentTime + this.accTime : currentTime - this.accTime
        seeking(this.targetTime)

        this.setState({ accTime: this.accTime })

        this.seekDelayTimeout = setTimeout(
            () => {
                device.play(this.targetTime)

                this.cleanUpListeners()
                this.cleanUpState()
            },
            200
        )
    }

    handleSeekEnd = () => {
        this.cleanUpListeners()

        const { device } = this.props

        if (this.lastTs) { // seeking started
            device.play(this.targetTime)
        } else {
            this.handleTapSeek()
            return
        }

        this.cleanUpState()
    }

    seekStep = () => {
        const timestamp = Date.now()
        const progress = (timestamp - this.lastTs) / 1000
        const accTime = (this.accTime || 0)

        let seekSpeed = 15
        if (accTime > 120) {
            seekSpeed = 60
        } else if (accTime > 30) {
            seekSpeed = 30
        }

        const newAccTime = accTime + Math.floor(progress * seekSpeed)

        const { seekMode } = this.state
        const { device: { currentTime, duration, seeking } } = this.props
        const targetTime = seekMode == 'ff' ? currentTime + newAccTime : currentTime - newAccTime

        if (targetTime < 0 || targetTime > duration) {
            clearInterval(this.stepInterval)
            return
        }

        this.accTime = newAccTime
        this.lastTs = timestamp
        this.targetTime = targetTime

        this.setState({ accTime: this.accTime })

        seeking(targetTime)
    }

    componentWillUnmount() {
        this.cleanUpListeners()
    }

    cleanUpState() {
        this.setState({ seekMode: null, accTime: null })

        this.stepInterval = null
        this.delayTimeout = null
        this.targetTime = null
        this.lastTs = null
        this.accTime = null
    }

    cleanUpListeners() {
        window.removeEventListener('pointermove', this.handlePreventScroll)
        window.removeEventListener('pointercancel', this.handleSeekEnd)
        window.removeEventListener('pointerup', this.handleSeekEnd)

        clearInterval(this.stepInterval)
        clearTimeout(this.delayTimeout)
        clearTimeout(this.seekDelayTimeout)
    }

    render() {
        const { seekMode, accTime } = this.state
        const { device: { isPlaying, isLoading }, onClick } = this.props
        const paused = accTime === null && !isPlaying

        return (
            <div
                className={`player__pause-zone ${(isPlaying || isLoading) ? '' : 'player__pause-cover'}`}
                onPointerDown={() => onClick()}
            >
                <div
                    className="playback-skip backward"
                    onPointerDown={this.handleFastRewind}
                >
                    {paused && <FastRewindIcon className="center" fontSize="inherit" />}
                </div>
                <div className="playback-skip__indicator">
                    {accTime !== null &&
                        <Typography className="center" variant="h2">
                            {seekMode == 'ff' ? '+' : '-'}{accTime}s
                        </Typography>
                    }
                    {paused && <PlayIcon className="center" fontSize="inherit" />}
                </div>
                <div
                    className="playback-skip forward"
                    onPointerDown={this.handleFastFroward}
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