import React from 'react'
import PropTypes from 'prop-types'
import BaseSelector from './BaseSelector'
import { observer } from 'mobx-react'
import {
    IconButton,
    MenuItem,
    MenuList
} from '@material-ui/core'
import { PlaylistPlay as PlaylistPlayIcon } from '@material-ui/icons'
import localization from '../localization'

@observer
class PlayModeSelector extends BaseSelector {

    selectPlayMode = (mode) => {
        this.props.device.setPlayMode(mode)
        this.handleClose()
    }

    renderButton() {
        return(
            <IconButton onClick={this.handleClick}>
                <PlaylistPlayIcon/>
            </IconButton>
        )
    }

    renderList() {
        const { playMode } = this.props.device

        const items = ['normal', 'play_once', 'repeat', 'shuffle'].map((id) => (
            <MenuItem key={id} selected={id == playMode} onClick={() => this.selectPlayMode(id)}>
                {localization.playMode[id]}
            </MenuItem>
        ))

        return (<MenuList>{items}</MenuList>)
    }
}

PlayModeSelector.propTypes = {
    device: PropTypes.object.isRequired
}

export default PlayModeSelector