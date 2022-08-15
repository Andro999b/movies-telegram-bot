import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import BaseSelector from './BaseSelector'
import {
    Button,
    MenuItem,
    MenuList
} from '@material-ui/core'
import analytics from '../utils/analytics'

@observer
class VideoQualitySelector extends BaseSelector {

    selectQuality = (quality) => {
        this.props.device.setQuality(quality)
        this.handleClose()

        analytics('select_quality')
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

        const items = qualities.map((id) => (
            <MenuItem key={id} selected={id == quality} onClick={() => this.selectQuality(id)}>
                {id}
            </MenuItem>
        )).concat([
            <MenuItem key="auto" selected={quality == null} onClick={() => this.selectQuality(null)}>
                Auto
            </MenuItem>
        ])

        return (<MenuList>{items}</MenuList>)
    }
}

VideoQualitySelector.propTypes = {
    device: PropTypes.object.isRequired
}

export default VideoQualitySelector