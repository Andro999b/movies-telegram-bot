import React, { useEffect, useState } from 'react'
import Selector from './Selector'
import { observer } from 'mobx-react-lite'
import {
  IconButton,
  MenuItem,
  MenuList,
  Tooltip
} from '@material-ui/core'
import { Settings as SettingsIcon } from '@material-ui/icons'
import localization from '../localization'
import { toHHMMSS } from '../utils'
import { watchHistoryStore } from '../store'

const PlayModeList = ({ playMode, setPlayMode, handleClose }) => {
  const items = ['normal', 'repeat', 'shuffle'].map((id) => (
    <MenuItem
      key={id}
      selected={id == playMode}
      onClick={() => {
        setPlayMode(id)
        handleClose()
      }}
    >
      {localization.playMode[id]}
    </MenuItem>
  ))

  return items
}

export default observer(({ device }) => {
  const [startTime, setStartTime] = useState()
  const { currentTime } = device

  const resetStartTime = async () => {
    await watchHistoryStore.updateStartTime(device.playlist, 0)
    setStartTime(0)
  }

  const setCurTimeAsStartTime = async () => {
    await watchHistoryStore.updateStartTime(device.playlist, currentTime)
    setStartTime(currentTime)
  }

  useEffect(() => {
    const fetch = async () => {
      const item = await watchHistoryStore.getHistoryItem(device.playlist)
      setStartTime(item?.startTime ?? 0)
    }
    fetch()
  }, [device.playlist])

  return (<Selector
    renderButton={({ handleOpen }) => {
      return (
        <Tooltip title={localization.settingsLabel}>
          <IconButton onClick={handleOpen}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      )
    }}
    renderList={({ handleClose }) => {
      const autoSkipSuffix = startTime == 0 ? '' : `(${toHHMMSS(startTime)})`

      return (
        <MenuList>
          <MenuItem disabled>{localization.playModeLabel}</MenuItem>
          <PlayModeList
            playMode={device.playMode}
            setPlayMode={device.setPlayMode}
            handleClose={handleClose}
          />
          <MenuItem disabled>{localization.autoSkip.label} {autoSkipSuffix}</MenuItem>
          {startTime != 0 && <MenuItem onClick={resetStartTime}>
            {localization.autoSkip.reset}
          </MenuItem>}
          {startTime == 0 && <MenuItem onClick={setCurTimeAsStartTime}>
            {localization.formatString(localization.autoSkip.fromCurrent, toHHMMSS(currentTime))}
          </MenuItem>}
        </MenuList>
      )
    }}
  />)
})
