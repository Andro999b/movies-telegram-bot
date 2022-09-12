import { IconButton, Typography } from '@material-ui/core'
import { Cloud, CloudOff } from '@material-ui/icons'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

class SyncButton extends Component {
    render() {
        const { insync, onConnect, onDisconnect } = this.props

        if (insync) {
            return (
                <Typography>
                    InSync
                    <IconButton onClick={onDisconnect}>
                        <Cloud />
                    </IconButton>
                </Typography>
            )
        } else {
            return (
                <Typography>
                    Not InSync
                    <IconButton onClick={onConnect}>
                        <CloudOff />
                    </IconButton>
                </Typography>
            )
        }
    }
}

SyncButton.propTypes = {
    insync: PropTypes.bool,
    onConnect: PropTypes.func.isRequired,
    onDisconnect: PropTypes.func.isRequired,
}

export default SyncButton
