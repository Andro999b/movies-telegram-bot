import React, { Component, Fragment } from 'react'
import {
    VolumeUpRounded as VolumeUpIcon,
    VolumeOffRounded as VolumeOffIcon
} from '@material-ui/icons'
import { 
    Slider,
    IconButton,
    Tooltip
} from '@material-ui/core'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import localization from '../localization'

@observer
class SoundControl extends Component {
    handleToggleMute = () => {
        this.props.device.toggleMute()
    }

    handleVolume = (_, volume) => {
        const { device } = this.props
        device.setVolume(volume / 100)
        device.setMute(false)
    }

    render() {
        const { device: { volume, isMuted } } = this.props
  
        return (
            <Fragment>
                <Slider className="sound-control__slider " value={volume * 100} onChange={this.handleVolume} />
                <Tooltip title={localization.formatString(localization.hotkey, 'M')}>
                    <IconButton onClick={this.handleToggleMute}>
                        { isMuted ? <VolumeOffIcon/> : <VolumeUpIcon/> }
                    </IconButton>
                </Tooltip>
            </Fragment>
        )
    }
}

SoundControl.propTypes = {
    device: PropTypes.object.isRequired
}

export default SoundControl