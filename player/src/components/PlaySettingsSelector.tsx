import React, { useEffect, useState } from 'react'
import Selector from './Selector'
import { observer } from 'mobx-react-lite'
import {
  IconButton,
  MenuItem,
  MenuList,
  Switch,
  Tooltip
} from '@mui/material'
import { Settings as SettingsIcon } from '@mui/icons-material'
import localization from '../localization'
import { toHHMMSS } from '../utils'
import { watchHistoryStore } from '../store'
import { Device } from '../store/player-store'
import analytics from '../utils/analytics'

interface PlayModeList {
  playMode: string,
  setPlayMode: (mode: string) => void
  handleClose: () => void
}

const PlayModeList: React.FC<PlayModeList> = ({ playMode, setPlayMode, handleClose }) => {
  const items = ['normal', 'repeat', 'shuffle'].map((id) => (
    <MenuItem
      key={id}
      selected={id == playMode}
      onClick={(): void => {
        setPlayMode(id)
        handleClose()
      }}
    >
      {/* @ts-ignore */}
      {localization.playMode[id]}
    </MenuItem>
  ))

  return (<>
    {items}
  </>)
}

interface QualitySelectorProps {
  device: Device,
  handleClose: () => void
}

const QualitySelector: React.FC<QualitySelectorProps> = ({ device, handleClose }): React.ReactElement => {
  const { quality, qualities } = device

  const selectQuality = (quality: number | null): void => {
    device.setQuality(quality)
    handleClose()

    analytics('select_quality')
  }

  return (
    <>
      <MenuItem disabled>{localization.videoQuality}</MenuItem>
      {qualities
        .map((id) => (
          <MenuItem key={id} selected={id == quality} onClick={(): void => selectQuality(id)}>
            {id}
          </MenuItem>
        ))
        .concat([
          <MenuItem key="auto" selected={quality == null} onClick={(): void => selectQuality(null)}>
            Auto
          </MenuItem>
        ])}
    </>
  )
}

interface Props {
  device: Device
}

const PlaySettingsSelector: React.FC<Props> = ({ device }): JSX.Element => {
  const [startTime, setStartTime] = useState(0)
  const { currentTime, showSubtitle } = device

  const resetStartTime = async (): Promise<void> => {
    await watchHistoryStore.updateStartTime(device.playlist, 0)
    setStartTime(0)
  }

  const setCurTimeAsStartTime = async (): Promise<void> => {
    await watchHistoryStore.updateStartTime(device.playlist, currentTime)
    setStartTime(currentTime)
  }

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      const item = await watchHistoryStore.getHistoryItem(device.playlist)
      setStartTime(item?.startTime ?? 0)
    }
    fetch()
  }, [device.playlist])

  const hasQualities = device.qualities.length > 1

  const toggleSubtitle = (): void => {
    device.setShowSubtitle(!showSubtitle)
  }

  return (
    <Selector
      renderButton={({ handleOpen }): React.ReactElement => {
        return (
          <Tooltip title={localization.settingsLabel}>
            <IconButton onClick={handleOpen} size="large">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        )
      }}
      renderList={({ handleClose }): React.ReactElement => {
        const autoSkipSuffix = startTime == 0 ? '' : `(${toHHMMSS(startTime)})`

        return (
          <MenuList>
            <MenuItem onClick={toggleSubtitle}>
              {showSubtitle ? localization.enableSubtitle : localization.disableSubtitle}
            </MenuItem>
            {hasQualities && <QualitySelector device={device} handleClose={handleClose} />}
            <MenuItem disabled>{localization.playModeLabel}</MenuItem>

            <PlayModeList
              playMode={device.playMode}
              setPlayMode={device.setPlayMode}
              handleClose={handleClose} />
            <MenuItem disabled>{localization.autoSkip.label} {autoSkipSuffix}</MenuItem>
            {startTime != 0 && <MenuItem onClick={resetStartTime}>
              {localization.autoSkip.reset}
            </MenuItem>}
            {startTime == 0 && <MenuItem onClick={setCurTimeAsStartTime}>
              {localization.formatString(localization.autoSkip.fromCurrent, toHHMMSS(currentTime))}
            </MenuItem>}
          </MenuList>
        )
      }} />
  )
}

export default observer(PlaySettingsSelector)
