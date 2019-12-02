import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import {
    Button,
    Menu,
    MenuItem
} from '@material-ui/core'

@observer
class VideoQualitySelector extends Component {

    constructor(props, context) {
        super(props, context)
        this.state = { anchorEl: null }
    }

    handleClick =(event) => {
        this.setState({ anchorEl: event.currentTarget })
    }

    handleClose = () => {
        this.setState({ anchorEl: null })
    }

    selectQuality = (quality) => {
        this.props.device.setQuality(quality)
        this.setState({ anchorEl: null })
    }

    render() {
        const { anchorEl } = this.state
        const { quality, qualities } = this.props.device

        return (
            <span>
                <Button onClick={this.handleClick}>
                    {quality ? quality : 'Auto'}
                </Button>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                >
                    {qualities.map((id) => (
                        <MenuItem key={id} selected={id == quality} onClick={() => this.selectQuality(id)}>
                            {id}
                        </MenuItem>
                    ))}
                </Menu>
            </span>
        )
    }
}

VideoQualitySelector.propTypes = {
    device: PropTypes.object.isRequired
}

export default VideoQualitySelector