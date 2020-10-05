import React from 'react'
import PropTypes from 'prop-types'
import BaseSelector from './BaseSelector'
import { observer } from 'mobx-react'
import {
    IconButton,
    Button,
    MenuItem,
    MenuList
} from '@material-ui/core'
import { AudiotrackRounded as AudioTrackIcon } from '@material-ui/icons'
import { isTouchDevice } from '../utils'
import localization from '../localization'
import analytics from '../utils/analytics'

@observer
class AudioTrackSelector extends BaseSelector {

    selectTrack = (id) => {
        this.props.device.setAudioTrack(id)
        this.handleClose()

        analytics('selectAudio')
    }

    renderButton() {
        if (isTouchDevice()) {
            return(
                <IconButton onClick={this.handleClick}>
                    <AudioTrackIcon/>
                </IconButton>
            )
        } else {
            const { audioTrack, audioTracks } = this.props.device
            const selectedTrack = audioTracks.find((it) => it.id == audioTrack)

            if(selectedTrack) {
                return (
                    <Button onClick={this.handleClick}>
                        {selectedTrack.name}
                    </Button>
                )
            } else {
                return(
                    <Button onClick={this.handleClick}>
                        {localization.translation}
                    </Button>
                )
            }
        }
    }

    renderList() {
        const { audioTrack, audioTracks } = this.props.device

        const items = audioTracks.map(({ id, name }) => (
            <MenuItem key={id} selected={id == audioTrack} onClick={() => this.selectTrack(id)}>
                {name}
            </MenuItem>
        ))

        return (<MenuList>{items}</MenuList>)
    }
}

AudioTrackSelector.propTypes = {
    device: PropTypes.object.isRequired
}

export default AudioTrackSelector