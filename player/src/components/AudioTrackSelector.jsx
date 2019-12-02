import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import {
    IconButton,
    MenuItem,
    MenuList,
    Popover,
    Paper
} from '@material-ui/core'
import { AudiotrackRounded as AudioTrackIcon } from '@material-ui/icons'

@observer
class AudioTrackSelector extends Component {

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

    selectTrack = (id) => {
        this.props.device.audioTrack = id
        this.setState({ anchorEl: null })
    }

    render() {
        const { anchorEl } = this.state
        const { audioTrack, audioTracks } = this.props.device

        return (
            <Fragment>
                <IconButton onClick={this.handleClick}>
                    <AudioTrackIcon/>
                </IconButton>
                <Popover 
                    anchorEl={anchorEl} 
                    open={Boolean(anchorEl)} 
                    onClose={this.handleClose}
                    disablePortal style={{ zIndex: 9999 }}
                >
                    <Paper>
                        <MenuList>
                            {audioTracks.map(({id, name}) => (
                                <MenuItem key={id} selected={id == audioTrack} onClick={() => this.selectTrack(id)}>
                                    {name}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Paper>
                </Popover>
            </Fragment>
        )
    }
}

AudioTrackSelector.propTypes = {
    device: PropTypes.object.isRequired
}

export default AudioTrackSelector