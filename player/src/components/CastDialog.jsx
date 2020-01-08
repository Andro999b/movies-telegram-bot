import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import {
    Dialog,
    DialogTitle,
    List,
    ListItem,
    ListItemText
} from '@material-ui/core'

@inject(
    ({ 
        castStore: { castDialog, closeCastDailog, devices }
    }) => ({ 
        options: castDialog, closeCastDailog, devices 
    })
)
@observer
class CastDialog extends Component {

    handleSelectDevice(device) {
        const { options: { onDeviceSelected } } = this.props
        onDeviceSelected(device)
    }

    render() {
        const { options, devices, closeCastDailog } = this.props
        
        if(options != null) {
            this.renderedContent =  <Fragment>
                {devices.length == 0 && <DialogTitle>No avaliable devices</DialogTitle>}
                {devices.length > 0 &&
                    <div>
                        <List>
                            {devices.map((device) =>
                                <ListItem key={device.name} button onClick={() => this.handleSelectDevice(device)}>
                                    <ListItemText style={{ wordBreak: 'break-all' }} primary={device.name} />
                                </ListItem>
                            )}
                        </List>
                    </div>
                }
            </Fragment>
        }

        return (
            <Dialog open={options != null} onClose={closeCastDailog}>
                <div>{this.renderedContent}</div>
            </Dialog>
        )
    }
}

CastDialog.propTypes = {
    options: PropTypes.shape({
        filter: PropTypes.func,
        onDeviceSelected: PropTypes.func
    }),
    devices: PropTypes.array,
    closeCastDailog: PropTypes.func
}

export default CastDialog