import React from 'react'
import {
  VolumeUpRounded as VolumeUpIcon,
  VolumeOffRounded as VolumeOffIcon
} from '@mui/icons-material'
import {
  Slider,
  IconButton,
  Tooltip
} from '@mui/material'
import { observer } from 'mobx-react-lite'
import localization from '../localization'
import { Device } from '../store/player-store'

interface Props {
  device: Device
}

const SoundControl: React.FC<Props> = ({ device }) => {
  const { volume, isMuted } = device

  const handleToggleMute = (): void => {
    device.toggleMute()
  }

  const handleVolume = (_: unknown, volume: number): void => {
    device.setVolume(volume / 100)
    device.setMute(false)
  }

  return <>
    <Slider className="sound-control__slider " value={volume * 100} onChange={handleVolume} />
    <Tooltip title={localization.formatString(localization.hotkey, 'M')}>
      <IconButton onClick={handleToggleMute} size="large">
        {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
      </IconButton>
    </Tooltip>
  </>
}

export default observer(SoundControl)
