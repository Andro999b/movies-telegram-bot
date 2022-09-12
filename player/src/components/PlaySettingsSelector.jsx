import React from 'react'
import PropTypes from 'prop-types'
import BaseSelector from './BaseSelector'
import { observer, inject } from 'mobx-react'
import {
    IconButton,
    MenuItem,
    MenuList,
    Tooltip
} from '@material-ui/core'
import { Settings as SettingsIcon } from '@material-ui/icons'
import localization from '../localization'
import { toHHMMSS } from '../utils'

@inject(({ watchHistoryStore: { getHistoryItem, updateStartTime } }) => ({
    getHistoryItem,
    updateStartTime
}))
@observer
class PlaySettingsSelector extends BaseSelector {
    state = {
        startTime: 0
    }

    selectPlayMode = (mode) => {
        this.props.device.setPlayMode(mode)
        this.handleClose()
    }

    resetStartTime = async () => {
        const { updateStartTime, device: { playlist } } = this.props
        await updateStartTime(playlist, 0)
        this.setState({ startTime: 0 })
    }

    setCurTimeAsStartTime = async () => {
        const { updateStartTime, device: { playlist , currentTime } } = this.props
        await updateStartTime(playlist, currentTime)
        this.setState({ startTime: currentTime })
    }

    async componentDidMount() {
        const { getHistoryItem, device: { playlist } } = this.props
        const item = await getHistoryItem(playlist)
        this.setState({ startTime: item?.startTime ?? 0 })
    }

    renderButton() {
        return (
            <Tooltip title={localization.settingsLabel}>
                <IconButton onClick={this.handleClick}>
                    <SettingsIcon />
                </IconButton>
            </Tooltip>
        )
    }

    renderPlayModeList() {
        const { playMode } = this.props.device

        const items = ['normal', 'play_once', 'repeat', 'shuffle'].map((id) => (
            <MenuItem key={id} selected={id == playMode} onClick={() => this.selectPlayMode(id)}>
                {localization.playMode[id]}
            </MenuItem>
        ))

        return items
    }

    renderList() {
        const { currentTime } = this.props.device
        const { startTime } = this.state
        const autoSkipSuffix = startTime == 0 ? '' : `(${toHHMMSS(startTime)})`

        return (
            <MenuList>
                <MenuItem disabled>{localization.playModeLabel}</MenuItem>
                {this.renderPlayModeList()}
                <MenuItem disabled>{localization.autoSkip.label} {autoSkipSuffix}</MenuItem>
                <MenuItem onClick={this.resetStartTime}>
                    {localization.autoSkip.reset}
                </MenuItem>
                <MenuItem onClick={this.setCurTimeAsStartTime}>
                    {localization.formatString(localization.autoSkip.fromCurrent, toHHMMSS(currentTime))}
                </MenuItem>
            </MenuList>
        )
    }
}

PlaySettingsSelector.propTypes = {
    getHistoryItem: PropTypes.func,
    updateStartTime: PropTypes.func,
    device: PropTypes.object.isRequired
}

export default PlaySettingsSelector