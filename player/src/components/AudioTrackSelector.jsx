import React from 'react'
import PropTypes from 'prop-types'
import BaseSelector from './BaseSelector'
import { observer } from 'mobx-react'
import {
    IconButton,
    MenuItem
} from '@material-ui/core'
import { AudiotrackRounded as AudioTrackIcon } from '@material-ui/icons'

@observer
class AudioTrackSelector extends BaseSelector {

    selectTrack = (id) => {
        this.props.device.audioTrack = id
        this.handleClose()
    }

    renderButton() {
        return (
            <IconButton onClick={this.handleClick}>
                <AudioTrackIcon/>
            </IconButton>
        )
    }

    renderList() {
        const { audioTrack, audioTracks } = this.props.device

        return audioTracks.map(({id, name}) => (
            <MenuItem key={id} selected={id == audioTrack} onClick={() => this.selectTrack(id)}>
                {name}
            </MenuItem>
        ))
    }
}

AudioTrackSelector.propTypes = {
    device: PropTypes.object.isRequired
}

export default AudioTrackSelector