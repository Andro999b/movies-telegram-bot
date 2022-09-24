import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Switch } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { PlayArrow, Pause } from '@material-ui/icons'
import { observer } from 'mobx-react'

const thumbStyle = {
    width: 20,
    height: 20,
    borderRadius: '50%',
    lineHeight: '20px'
}

@observer
class AutoPlaySwitch extends Component {
    render() {
        const { device } = this.props

        return (
            <Switch
                checked={device.autoPlay}
                checkedIcon={this.renderThumbIcon(true)}
                icon={this.renderThumbIcon(false)}
                onChange={(e) => device.setAutoPlay(e.currentTarget.checked)}
            />
        )
    }

    renderThumbIcon(checked) {
        return (
            <span style={{ ...thumbStyle, backgroundColor: checked ? '#fff' : grey[700] }}>
                {checked ? 
                    <PlayArrow fontSize='small' htmlColor={grey[700]}/>:
                    <Pause fontSize='small' htmlColor='#fff'/>
                }
            </span>
        )
    }
}

AutoPlaySwitch.propTypes = {
    device: PropTypes.object.isRequired
}

export default AutoPlaySwitch