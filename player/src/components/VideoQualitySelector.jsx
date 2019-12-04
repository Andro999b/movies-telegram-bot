import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import BaseSelector from './BaseSelector'
import {
    Button,
    MenuItem
} from '@material-ui/core'

@observer
class VideoQualitySelector extends BaseSelector {

    selectQuality = (quality) => {
        this.props.device.setQuality(quality)
        this.handleClose()
    }

    renderButton() {
        const { quality } = this.props.device
        return (
            <Button onClick={this.handleClick}>
                {quality ? quality : 'Auto'}
            </Button>
        )
    }

    renderList() {
        const { quality, qualities } = this.props.device

        return qualities.map((id) => (
            <MenuItem key={id} selected={id == quality} onClick={() => this.selectQuality(id)}>
                {id}
            </MenuItem>
        ))
    }
}

VideoQualitySelector.propTypes = {
    device: PropTypes.object.isRequired
}

export default VideoQualitySelector