import React, { Component, Fragment } from 'react'
import { observer } from 'mobx-react'
import {
    MenuList,
    Popover,
    Paper
} from '@material-ui/core'

@observer
class BaseSelector extends Component {

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

    renderButton() {}
    renderList() {}

    render() {
        const { anchorEl } = this.state

        return (
            <Fragment>
                {this.renderButton()}
                <Popover 
                    anchorEl={anchorEl} 
                    open={Boolean(anchorEl)} 
                    onClose={this.handleClose}
                    disablePortal style={{ zIndex: 9999 }}
                >
                    <Paper>
                        <MenuList>
                            {this.renderList()}
                        </MenuList>
                    </Paper>
                </Popover>
            </Fragment>
        )
    }
}

export default BaseSelector