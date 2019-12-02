import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import {
    Button,
    MenuItem,
    MenuList,
    Popover,
    Paper
} from '@material-ui/core'

@observer
class VideoQualitySelector extends Component {

    constructor(props, context) {
        super(props, context)
        this.state = { anchorEl: null }
    }

    handleClick =(event) => {
        const target = event.currentTarget
        this.setState(({ anchorEl }) => ({
            anchorEl: anchorEl ? null : target
        }))
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
            <Fragment>
                <Button onClick={this.handleClick}>
                    {quality ? quality : 'Auto'}
                </Button>
                <Popover 
                    anchorEl={anchorEl} 
                    open={Boolean(anchorEl)} 
                    onClose={this.handleClose}
                    disablePortal style={{ zIndex: 9999 }}
                >
                    <Paper>
                        <MenuList>
                            {qualities.map((id) => (
                                <MenuItem key={id} selected={id == quality} onClick={() => this.selectQuality(id)}>
                                    {id}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Paper>
                </Popover>
            </Fragment>
        )
    }
}

VideoQualitySelector.propTypes = {
    device: PropTypes.object.isRequired
}

export default VideoQualitySelector