import React, { Component, Fragment } from 'react'
import {
    Popover,
    Paper
} from '@material-ui/core'

class BaseSelector extends Component {

    constructor(props, context) {
        super(props, context)
        this.state = { anchorEl: null }
    }

    handleClick = (e) => {
        const target = e.currentTarget
        this.setState(({ anchorEl }) => ({
            anchorEl: anchorEl ? null : target
        }))
    }

    handleClose = () => {
        this.setState({ anchorEl: null })
    }

    renderButton() {}
    renderList() {}

    render() {
        const { anchorEl } = this.state

        return (
            <Fragment>
                {this.renderButton()}
                <Popover 
                    container={document.getElementById('player_root')}
                    anchorEl={anchorEl} 
                    open={Boolean(anchorEl)} 
                    onClose={this.handleClose}
                    style={{ zIndex: 9999 }}
                >
                    <Paper>
                        {this.renderList()}
                    </Paper>
                </Popover>
            </Fragment>
        )
    }
}

export default BaseSelector