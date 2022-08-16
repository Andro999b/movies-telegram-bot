import React, { Component, Fragment } from 'react'
import {
    Popover,
    Paper
} from '@material-ui/core'

class BaseSelector extends Component {
    state = { anchorEl: null }

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

        const button = this.renderButton()
        const list = this.renderList()

        if(button == null || list == null)
            return null

        return (
            <Fragment>
                {button}
                <Popover 
                    container={document.getElementById('player_root')}
                    anchorEl={anchorEl} 
                    open={Boolean(anchorEl)} 
                    onClose={this.handleClose}
                    style={{ zIndex: 9999 }}
                >
                    <Paper>
                        {list}
                    </Paper>
                </Popover>
            </Fragment>
        )
    }
}

export default BaseSelector